import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { parse } from 'jsonc-parser';
import {
  createSourceFile,
  forEachChild,
  isIdentifier,
  isImportDeclaration,
  isNoSubstitutionTemplateLiteral,
  isStringLiteral,
  Node,
  ObjectLiteralElementLike,
  ObjectLiteralExpression,
  ScriptTarget,
  SourceFile,
} from 'typescript';
import { JSONFile } from '../../utils/json-file.util.js';
import {
  getPackageJsonDependency,
  NodeDependencyType,
} from '../../utils/dependencies.utils.js';

export const MIGRATION_GUIDE_URL = 'https://docs.nestjs.com/migration-guide';

export interface TextEdit {
  start: number;
  end: number;
  text: string;
}

/**
 * Collects everything the upgrade did (or could not do) so it can be
 * printed as a single summary at the end of the run.
 */
export class UpgradeReport {
  readonly changes: string[] = [];
  readonly notes: string[] = [];
  readonly warnings: string[] = [];
  readonly actions: string[] = [];

  change(message: string) {
    this.changes.push(message);
  }

  note(message: string) {
    this.notes.push(message);
  }

  warn(message: string) {
    this.warnings.push(message);
  }

  /** Something the user has to do by hand. */
  action(message: string) {
    this.actions.push(message);
  }

  print(context: SchematicContext) {
    const { logger } = context;
    const section = (
      title: string,
      items: string[],
      bullet: string,
      level: 'info' | 'warn',
    ) => {
      if (items.length === 0) {
        return;
      }
      logger[level]('');
      logger[level](title);
      items.forEach((item) => logger[level](`  ${bullet} ${item}`));
    };
    section('Changes applied:', this.changes, '✔', 'info');
    section('Notes:', this.notes, 'ℹ', 'info');
    section('Please review:', this.warnings, '⚠', 'warn');
    section('Action required:', this.actions, '➜', 'warn');
    logger.info('');
    logger.info(`Full migration guide: ${MIGRATION_GUIDE_URL}`);
  }
}

/**
 * Extracts the major version from a semver range (`^11.0.0`, `~11.1`, `11`,
 * `>=11 <12`, `12.0.0-alpha.1`). Returns `null` for dist-tags and other
 * non-semver specifiers (`next`, `latest`, `*`, `workspace:*`, `file:`...).
 */
export function parseMajor(range: string | undefined | null): number | null {
  if (!range) {
    return null;
  }
  const match = /^\s*(?:[\^~]|>=?|=)?\s*v?(\d+)(?:\.|$|\s|-|x)/.exec(
    range.trim(),
  );
  return match ? Number(match[1]) : null;
}

/**
 * Extracts `[major, minor]` from a semver range (`^29.2.5` → `[29, 2]`).
 * Returns `null` when the minor cannot be determined.
 */
export function parseMajorMinor(
  range: string | undefined | null,
): [number, number] | null {
  if (!range) {
    return null;
  }
  const match = /^\s*(?:[\^~]|>=?|=)?\s*v?(\d+)\.(\d+)/.exec(range.trim());
  return match ? [Number(match[1]), Number(match[2])] : null;
}

export function parseVersion(version: string): number[] {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(version);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [];
}

export function readJsonFile<T = Record<string, any>>(
  tree: Tree,
  path: string,
): T | null {
  const buffer = tree.read(path);
  if (!buffer) {
    return null;
  }
  try {
    return parse(buffer.toString('utf-8')) as T;
  } catch {
    return null;
  }
}

export function readPackageJson(tree: Tree): Record<string, any> | null {
  return readJsonFile(tree, 'package.json');
}

export interface NestCliProject {
  type?: string;
  root?: string;
  sourceRoot?: string;
  entryFile?: string;
}

export interface NestCliConfig {
  sourceRoot: string;
  entryFile: string;
  projects: Record<string, NestCliProject>;
}

const NEST_CLI_CONFIG_FILES = [
  'nest-cli.json',
  '.nestcli.json',
  '.nest-cli.json',
  'nest.json',
];

export function findNestCliConfigPath(tree: Tree): string | undefined {
  return NEST_CLI_CONFIG_FILES.find((candidate) => tree.exists(candidate));
}

export function readNestCliConfig(tree: Tree): NestCliConfig {
  const path = findNestCliConfigPath(tree);
  const config = path ? (readJsonFile(tree, path) ?? {}) : {};
  return {
    sourceRoot: config.sourceRoot ?? 'src',
    entryFile: config.entryFile ?? 'main',
    projects: config.projects ?? {},
  };
}

/**
 * Removes a dependency from whichever `package.json` section it lives in.
 * Returns the section it was removed from, or `null` if it was not present.
 */
export function removePackageJsonDependency(
  tree: Tree,
  name: string,
): NodeDependencyType | null {
  const dependency = getPackageJsonDependency(tree, name);
  if (!dependency) {
    return null;
  }
  const json = new JSONFile(tree, '/package.json');
  json.remove([dependency.type, name]);
  return dependency.type;
}

/**
 * Lists every directory that may contain application sources: the source
 * roots declared in `nest-cli.json` plus the conventional `src`, `apps`,
 * `libs` and `test` folders.
 */
export function getSourceRoots(tree: Tree): string[] {
  const config = readNestCliConfig(tree);
  const roots = new Set<string>([
    config.sourceRoot,
    'src',
    'apps',
    'libs',
    'test',
  ]);
  Object.values(config.projects).forEach((project) => {
    if (project?.sourceRoot) {
      roots.add(project.sourceRoot);
    }
  });
  return [...roots].map((root) =>
    root.replace(/^\.?\//, '').replace(/\/$/, ''),
  );
}

export function isTsSourceFile(path: string): boolean {
  return path.endsWith('.ts') && !path.endsWith('.d.ts');
}

/**
 * Collects every TypeScript source file below the given roots, skipping
 * `node_modules` and build output.
 */
export function collectSourceFiles(tree: Tree, roots: string[]): string[] {
  const files = new Set<string>();
  for (const root of roots) {
    tree.getDir(root).visit((path) => {
      if (
        isTsSourceFile(path) &&
        !path.includes('/node_modules/') &&
        !path.includes('/dist/')
      ) {
        files.add(path);
      }
    });
  }
  return [...files].sort();
}

export function parseSource(path: string, content: string): SourceFile {
  return createSourceFile(path, content, ScriptTarget.Latest, true);
}

export function forEachDescendant(
  node: Node,
  visitor: (node: Node) => void,
): void {
  visitor(node);
  forEachChild(node, (child) => forEachDescendant(child, visitor));
}

/**
 * Returns `true` when the source file imports from any of the given modules.
 */
export function importsAnyOf(source: SourceFile, modules: string[]): boolean {
  return source.statements.some(
    (statement) =>
      isImportDeclaration(statement) &&
      isStringLiteral(statement.moduleSpecifier) &&
      modules.includes(statement.moduleSpecifier.text),
  );
}

export function getPropertyName(
  property: ObjectLiteralElementLike,
): string | undefined {
  const name = property.name;
  if (!name) {
    return undefined;
  }
  if (
    isIdentifier(name) ||
    isStringLiteral(name) ||
    isNoSubstitutionTemplateLiteral(name)
  ) {
    return name.text;
  }
  return undefined;
}

export function findProperty(
  literal: ObjectLiteralExpression,
  name: string,
): ObjectLiteralElementLike | undefined {
  return literal.properties.find(
    (property) => getPropertyName(property) === name,
  );
}

/**
 * Produces an edit that deletes a property (with its leading trivia and the
 * comma that follows it, if any) from an object literal.
 */
export function removePropertyEdit(
  content: string,
  property: ObjectLiteralElementLike,
): TextEdit {
  const start = property.getFullStart();
  let end = property.getEnd();
  while (end < content.length && /\s/.test(content[end])) {
    end++;
  }
  if (content[end] === ',') {
    end++;
  } else {
    end = property.getEnd();
  }
  return { start, end, text: '' };
}

/**
 * Applies edits to a string. Edits must not overlap.
 */
export function applyEdits(content: string, edits: TextEdit[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let result = content;
  for (const edit of sorted) {
    result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  }
  return result;
}

/**
 * Returns the quote character used by a string literal node (defaults to `'`).
 */
export function quoteOf(node: Node, source: SourceFile): string {
  const text = node.getText(source);
  return text.startsWith('"') ? '"' : "'";
}
