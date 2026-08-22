import { dirname, join, normalize, Path } from '@angular-devkit/core';
import { Rule, Tree } from '@angular-devkit/schematics';
import {
  CallExpression,
  ImportDeclaration,
  isCallExpression,
  isIdentifier,
  isImportDeclaration,
  isNamedImports,
  isObjectLiteralExpression,
  isPropertyAccessExpression,
  isStringLiteral,
  SourceFile,
} from 'typescript';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
  NodeDependencyType,
} from '../../../utils/dependencies.utils.js';
import { MetadataManager } from '../../../utils/metadata.manager.js';
import {
  applyEdits,
  findProperty,
  forEachDescendant,
  parseSource,
  quoteOf,
  readNestCliConfig,
  readPackageJson,
  TextEdit,
  UpgradeReport,
} from '../upgrade.utils.js';

const OBSERVE_PACKAGE = '@nestjs/observe';
const OBSERVE_VERSION = '^0.1.0';
const OBSERVE_DOCS = 'https://github.com/nestjs/observe';

interface ApplicationTarget {
  /** Path to the `main.ts` entry file. */
  mainPath: Path;
  /** Value used for `serviceId` in `ObserveModule.forRoot()`. */
  serviceId: string;
}

/**
 * Installs `@nestjs/observe` and wires it up following the package README:
 *  - `export const { ObserveModule, ObserveInstrument } = createObserveModule();`
 *    plus `ObserveModule.forRoot({...})` in the root module,
 *  - `{ instrument: ObserveInstrument }` passed to `NestFactory.create()`.
 *
 * In a monorepo every `application` project declared in `nest-cli.json` is
 * wired up, using the project name as `serviceId`.
 */
export function setupObserve(report: UpgradeReport): Rule {
  return (tree: Tree) => {
    if (getPackageJsonDependency(tree, OBSERVE_PACKAGE)) {
      report.note(
        `"${OBSERVE_PACKAGE}" is already installed; skipping the automatic setup.`,
      );
      return tree;
    }
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: OBSERVE_PACKAGE,
      version: OBSERVE_VERSION,
    });
    report.change(
      `Added "${OBSERVE_PACKAGE}@${OBSERVE_VERSION}" to dependencies`,
    );

    const targets = collectApplications(tree);
    if (targets.length === 0) {
      report.action(
        `Could not find an application entry file — wire up @nestjs/observe manually following ${OBSERVE_DOCS}#readme.`,
      );
    }
    for (const target of targets) {
      wireApplication(tree, target, report);
    }

    report.action(
      'Set the OBSERVE_APP_KEY and OBSERVE_APP_SECRET environment variables (sign up at https://observe.nestjs.com — free for up to 300,000 events a month).',
    );
    return tree;
  };
}

/**
 * Lists the applications to instrument: the root application (from the
 * top-level `sourceRoot`/`entryFile`) plus every non-library project in a
 * monorepo. Duplicates (the root project usually also appears under
 * `projects`) are collapsed by entry file.
 */
function collectApplications(tree: Tree): ApplicationTarget[] {
  const config = readNestCliConfig(tree);
  const targets = new Map<Path, ApplicationTarget>();
  const add = (
    sourceRoot: string | undefined,
    entryFile: string | undefined,
    serviceId: string,
  ) => {
    if (!sourceRoot) {
      return;
    }
    const mainPath = normalize(`${sourceRoot}/${entryFile ?? 'main'}.ts`);
    if (tree.exists(mainPath) && !targets.has(mainPath)) {
      targets.set(mainPath, { mainPath, serviceId });
    }
  };

  for (const [name, project] of Object.entries(config.projects)) {
    if (project?.type === 'library') {
      continue;
    }
    const sourceRoot =
      project?.sourceRoot ??
      (project?.root ? `${project.root}/src` : undefined);
    add(sourceRoot, project?.entryFile, name);
  }
  add(config.sourceRoot, config.entryFile, getServiceId(tree));
  return [...targets.values()];
}

function wireApplication(
  tree: Tree,
  { mainPath, serviceId }: ApplicationTarget,
  report: UpgradeReport,
): void {
  const manual = (reason: string) =>
    report.action(
      `${reason} — wire up @nestjs/observe manually following ${OBSERVE_DOCS}#readme.`,
    );

  const mainContent = tree.read(mainPath)!.toString('utf-8');
  const mainSource = parseSource(mainPath, mainContent);
  const createCall = findNestFactoryCreate(mainSource);
  if (!createCall || createCall.arguments.length === 0) {
    manual(`Could not find a "NestFactory.create(...)" call in "${mainPath}"`);
    return;
  }
  const rootModuleArgument = createCall.arguments[0];
  if (!isIdentifier(rootModuleArgument)) {
    manual(`Could not determine the root module in "${mainPath}"`);
    return;
  }
  const rootModuleName = rootModuleArgument.text;
  const moduleImport = findImportOf(mainSource, rootModuleName);
  const specifier =
    moduleImport && isStringLiteral(moduleImport.moduleSpecifier)
      ? moduleImport.moduleSpecifier.text
      : undefined;
  if (!moduleImport || !specifier || !specifier.startsWith('.')) {
    manual(`Could not locate the file declaring "${rootModuleName}"`);
    return;
  }
  const modulePath = resolveModulePath(tree, mainPath, specifier);
  if (!modulePath) {
    manual(`Could not resolve "${specifier}" imported in "${mainPath}"`);
    return;
  }

  const moduleContent = tree.read(modulePath)!.toString('utf-8');
  if (moduleContent.includes('createObserveModule')) {
    report.note(
      `${modulePath}: "createObserveModule()" is already present; leaving the module untouched.`,
    );
  } else {
    const updated = wireRootModule(modulePath, moduleContent, serviceId);
    if (!updated) {
      manual(`Could not find a "@Module()" decorator in "${modulePath}"`);
      return;
    }
    tree.overwrite(modulePath, updated);
    report.change(
      `${modulePath}: exported "ObserveModule"/"ObserveInstrument" via createObserveModule() and registered "ObserveModule.forRoot({ serviceId: '${serviceId}' })"`,
    );
  }

  const updatedMain = wireMain(
    mainSource,
    mainContent,
    createCall,
    moduleImport,
    report,
    mainPath,
  );
  if (updatedMain !== mainContent) {
    tree.overwrite(mainPath, updatedMain);
    report.change(
      `${mainPath}: passed "{ instrument: ObserveInstrument }" to NestFactory.create()`,
    );
  }
}

function findNestFactoryCreate(source: SourceFile): CallExpression | undefined {
  let found: CallExpression | undefined;
  forEachDescendant(source, (node) => {
    if (found || !isCallExpression(node)) {
      return;
    }
    const callee = node.expression;
    if (
      isPropertyAccessExpression(callee) &&
      isIdentifier(callee.expression) &&
      callee.expression.text === 'NestFactory' &&
      callee.name.text === 'create'
    ) {
      found = node;
    }
  });
  return found;
}

function findImportOf(
  source: SourceFile,
  identifier: string,
): ImportDeclaration | undefined {
  return source.statements.find((statement): statement is ImportDeclaration => {
    if (!isImportDeclaration(statement) || !statement.importClause) {
      return false;
    }
    const { name, namedBindings } = statement.importClause;
    if (name?.text === identifier) {
      return true;
    }
    return (
      !!namedBindings &&
      isNamedImports(namedBindings) &&
      namedBindings.elements.some((element) => element.name.text === identifier)
    );
  });
}

function resolveModulePath(
  tree: Tree,
  fromPath: Path,
  specifier: string,
): Path | undefined {
  const base = join(
    dirname(fromPath),
    specifier.replace(/\.(js|mjs|cjs|ts)$/, ''),
  );
  const candidates = [`${base}.ts`, join(base, 'index.ts')];
  return candidates.find((candidate) => tree.exists(candidate)) as
    | Path
    | undefined;
}

function getServiceId(tree: Tree): string {
  const name = readPackageJson(tree)?.name;
  return typeof name === 'string' && name.length > 0
    ? name.replace(/^@[^/]+\//, '')
    : 'app';
}

function wireRootModule(
  path: string,
  content: string,
  serviceId: string,
): string | undefined {
  const source = parseSource(path, content);
  const imports = source.statements.filter(isImportDeclaration);
  const lastImport = imports[imports.length - 1];
  const quote = lastImport ? quoteOf(lastImport.moduleSpecifier, source) : "'";
  const declaration =
    `import { createObserveModule } from ${quote}${OBSERVE_PACKAGE}${quote};\n\n` +
    'export const { ObserveModule, ObserveInstrument } = createObserveModule();';
  const withDeclaration = lastImport
    ? applyEdits(content, [
        {
          start: lastImport.getEnd(),
          end: lastImport.getEnd(),
          text: `\n${declaration}`,
        },
      ])
    : `${declaration}\n${content}`;

  const symbol =
    'ObserveModule.forRoot({\n' +
    `      appKey: process.env.OBSERVE_APP_KEY,\n` +
    `      appSecret: process.env.OBSERVE_APP_SECRET,\n` +
    `      serviceId: ${quote}${serviceId}${quote},\n` +
    '    })';
  // MetadataManager drops an element straight into an empty array
  // (`imports: [Observe...]`); lay it out on its own lines instead.
  const emptyImports = /imports:\s*\[\s*\]/;
  if (emptyImports.test(withDeclaration)) {
    return withDeclaration.replace(
      emptyImports,
      `imports: [\n    ${symbol},\n  ]`,
    );
  }
  return new MetadataManager(withDeclaration).insert('imports', symbol);
}

function wireMain(
  source: SourceFile,
  content: string,
  createCall: CallExpression,
  moduleImport: ImportDeclaration,
  report: UpgradeReport,
  path: string,
): string {
  const edits: TextEdit[] = [];

  const namedBindings = moduleImport.importClause?.namedBindings;
  const alreadyImported =
    !!namedBindings &&
    isNamedImports(namedBindings) &&
    namedBindings.elements.some(
      (element) => element.name.text === 'ObserveInstrument',
    );
  if (!alreadyImported) {
    if (
      namedBindings &&
      isNamedImports(namedBindings) &&
      namedBindings.elements.length > 0
    ) {
      const last = namedBindings.elements[namedBindings.elements.length - 1];
      edits.push({
        start: last.getEnd(),
        end: last.getEnd(),
        text: ', ObserveInstrument',
      });
    } else {
      const quote = quoteOf(moduleImport.moduleSpecifier, source);
      const specifier = isStringLiteral(moduleImport.moduleSpecifier)
        ? moduleImport.moduleSpecifier.text
        : '';
      edits.push({
        start: moduleImport.getEnd(),
        end: moduleImport.getEnd(),
        text: `\nimport { ObserveInstrument } from ${quote}${specifier}${quote};`,
      });
    }
  }

  const args = createCall.arguments;
  const lastArgument = args[args.length - 1];
  if (args.length >= 2 && isObjectLiteralExpression(lastArgument)) {
    if (findProperty(lastArgument, 'instrument')) {
      report.note(
        `${path}: NestFactory.create() already receives an "instrument" option.`,
      );
      return alreadyImported ? content : applyEdits(content, edits);
    }
    if (lastArgument.properties.length === 0) {
      edits.push({
        start: lastArgument.getStart(source),
        end: lastArgument.getEnd(),
        text: '{ instrument: ObserveInstrument }',
      });
    } else {
      const lastProperty =
        lastArgument.properties[lastArgument.properties.length - 1];
      const separator = (lastProperty
        .getFullText(source)
        .match(/^\r?\n\s*/) || [' '])[0];
      edits.push({
        start: lastProperty.getEnd(),
        end: lastProperty.getEnd(),
        text: `,${separator}instrument: ObserveInstrument`,
      });
    }
  } else {
    edits.push({
      start: lastArgument.getEnd(),
      end: lastArgument.getEnd(),
      text: ', {\n    instrument: ObserveInstrument,\n  }',
    });
  }
  return applyEdits(content, edits);
}
