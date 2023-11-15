import { join, normalize, Path, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  FileEntry,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicsException,
  Source,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { existsSync, readFileSync } from 'fs';
import { parse, stringify } from 'comment-json';
import { normalizeToCase } from '../../utils/formatting';
import {
  DEFAULT_APPS_PATH,
  DEFAULT_APP_NAME,
  DEFAULT_DIR_ENTRY_APP,
  DEFAULT_LANGUAGE,
  DEFAULT_LIB_PATH,
  DEFAULT_PATH_NAME,
  PROJECT_TYPE,
  TEST_ENV,
} from '../defaults';
import { SubAppOptions } from './sub-app.schema';

type UpdateJsonFn<T> = (obj: T) => T | void;
interface TsConfigPartialType {
  compilerOptions: {
    baseUrl: string;
    paths: {
      [key: string]: string[];
    };
  };
}

export function main(options: SubAppOptions): Rule {
  const appName = getAppNameFromPackageJson();
  options = transform(options);
  return chain([
    updateTsConfig(),
    updatePackageJson(options, appName),
    (tree, context) =>
      isMonorepo(tree)
        ? noop()(tree, context)
        : chain([
            branchAndMerge(mergeWith(generateWorkspace(options, appName))),
            moveDefaultAppToApps(options.path, appName, options.sourceRoot),
          ])(tree, context),
    addAppsToCliOptions(options.path, options.name, appName),
    branchAndMerge(mergeWith(generate(options))),
  ]);
}

function getAppNameFromPackageJson(): string {
  try {
    if (!existsSync('./package.json')) {
      return DEFAULT_DIR_ENTRY_APP;
    }
    const packageJson = JSON.parse(
      stripBom(readFileSync('./package.json', 'utf-8')),
    );
    if (!packageJson.name) {
      return DEFAULT_DIR_ENTRY_APP;
    }
    let name = packageJson.name;
    name = name.replace(/[^\w.]+/g, '-').replace(/\-+/g, '-');
    return name[0] === '-' ? name.substr(1) : name;
  } catch {
    return DEFAULT_DIR_ENTRY_APP;
  }
}

function stripBom(value: string): string {
  if (value.charCodeAt(0) === 0xfeff) {
    return value.slice(1);
  }
  return value;
}

function transform(options: SubAppOptions): SubAppOptions {
  const target: SubAppOptions = Object.assign({}, options);
  const defaultSourceRoot =
    options.rootDir !== undefined ? options.rootDir : DEFAULT_APPS_PATH;

  if (!target.name) {
    target.name = DEFAULT_APP_NAME;
  }
  target.language = !!target.language ? target.language : DEFAULT_LANGUAGE;
  target.name = normalizeToCase(target.name, 'kebab-or-snake');
  target.path =
    target.path !== undefined
      ? join(normalize(defaultSourceRoot), target.path)
      : normalize(defaultSourceRoot);

  return target;
}

function isMonorepo(host: Tree) {
  const nestFileExists = host.exists('nest.json');
  const nestCliFileExists = host.exists('nest-cli.json');
  if (!nestFileExists && !nestCliFileExists) {
    return false;
  }
  const filename = nestCliFileExists ? 'nest-cli.json' : 'nest.json';
  const source = host.read(filename);
  if (!source) {
    return false;
  }
  const sourceText = source.toString('utf-8');
  const optionsObj = parse(sourceText) as Record<string, any>;
  return !!optionsObj.monorepo;
}

function updateJsonFile<T>(
  host: Tree,
  path: string,
  callback: UpdateJsonFn<T>,
): Tree {
  const source = host.read(path);
  if (source) {
    const sourceText = source.toString('utf-8');
    const json = parse(sourceText);
    callback(json as unknown as T);
    host.overwrite(path, stringify(json, null, 2));
  }
  return host;
}

function updateTsConfig() {
  return (host: Tree) => {
    if (!host.exists('tsconfig.json')) {
      return host;
    }
    return updateJsonFile(
      host,
      'tsconfig.json',
      (tsconfig: TsConfigPartialType) => {
        if (!tsconfig.compilerOptions) {
          tsconfig.compilerOptions = {} as any;
        }
        if (!tsconfig.compilerOptions.baseUrl) {
          tsconfig.compilerOptions.baseUrl = './';
        }
        if (!tsconfig.compilerOptions.paths) {
          tsconfig.compilerOptions.paths = {};
        }
      },
    );
  };
}

function updatePackageJson(options: SubAppOptions, defaultAppName: string) {
  return (host: Tree) => {
    if (!host.exists('package.json')) {
      return host;
    }
    return updateJsonFile(
      host,
      'package.json',
      (packageJson: Record<string, any>) => {
        updateNpmScripts(packageJson.scripts, options, defaultAppName);
        updateJestOptions(packageJson.jest, options);
      },
    );
  };
}

function updateNpmScripts(
  scripts: Record<string, any>,
  options: SubAppOptions,
  defaultAppName: string,
) {
  if (!scripts) {
    return;
  }
  const defaultFormatScriptName = 'format';
  const defaultStartScriptName = 'start:prod';
  const defaultTestScriptName = 'test:e2e';
  if (
    !scripts[defaultTestScriptName] &&
    !scripts[defaultFormatScriptName] &&
    !scripts[defaultStartScriptName]
  ) {
    return;
  }
  if (
    scripts[defaultTestScriptName] &&
    scripts[defaultTestScriptName].indexOf(options.path as string) < 0
  ) {
    const defaultTestDir = 'test';
    const newTestDir = join(
      options.path as Path,
      defaultAppName,
      defaultTestDir,
    );
    scripts[defaultTestScriptName] = (
      scripts[defaultTestScriptName] as string
    ).replace(defaultTestDir, newTestDir);
  }
  if (
    scripts[defaultFormatScriptName] &&
    scripts[defaultFormatScriptName].indexOf(DEFAULT_PATH_NAME) >= 0
  ) {
    const defaultSourceRoot =
      options.rootDir !== undefined ? options.rootDir : DEFAULT_APPS_PATH;
    scripts[
      defaultFormatScriptName
    ] = `prettier --write "${defaultSourceRoot}/**/*.ts" "${DEFAULT_LIB_PATH}/**/*.ts"`;
  }
  if (
    scripts[defaultStartScriptName] &&
    scripts[defaultStartScriptName].indexOf('dist/main') >= 0
  ) {
    const defaultSourceRoot =
      options.rootDir !== undefined ? options.rootDir : DEFAULT_APPS_PATH;
    scripts[
      defaultStartScriptName
    ] = `node dist/${defaultSourceRoot}/${defaultAppName}/main`;
  }
}

function updateJestOptions(
  jestOptions: Record<string, any>,
  options: SubAppOptions,
) {
  if (!jestOptions) {
    return;
  }
  if (jestOptions.rootDir === DEFAULT_PATH_NAME) {
    jestOptions.rootDir = '.';
    jestOptions.coverageDirectory = './coverage';
  }
  const defaultSourceRoot =
    options.rootDir !== undefined ? options.rootDir : DEFAULT_APPS_PATH;
  const jestSourceRoot = `<rootDir>/${defaultSourceRoot}/`;
  if (!jestOptions.roots) {
    jestOptions.roots = [jestSourceRoot];
  } else if (jestOptions.roots.indexOf(jestSourceRoot) < 0) {
    jestOptions.roots.push(jestSourceRoot);

    const originalSourceRoot = `<rootDir>/src/`;
    const originalSourceRootIndex =
      jestOptions.roots.indexOf(originalSourceRoot);
    if (originalSourceRootIndex >= 0) {
      (jestOptions.roots as string[]).splice(originalSourceRootIndex, 1);
    }
  }
}

function moveDefaultAppToApps(
  projectRoot: string,
  appName: string,
  sourceRoot = DEFAULT_PATH_NAME,
): Rule {
  return (host: Tree) => {
    if (process.env.NODE_ENV === TEST_ENV) {
      return host;
    }
    const appDestination = join(projectRoot as Path, appName);

    moveDirectoryTo(sourceRoot, appDestination, host);

    moveDirectoryTo('test', appDestination, host);
    return host;
  };
}

function moveDirectoryTo(
  srcDir: string,
  destination: string,
  tree: Tree,
): void {
  let srcDirExists = false;
  tree.getDir(srcDir).visit((filePath: Path, file: Readonly<FileEntry>) => {
    srcDirExists = true;
    const newFilePath = join(destination as Path, filePath);
    tree.create(newFilePath, file.content);
  });
  if (srcDirExists) {
    tree.delete(srcDir);
  }
}

function addAppsToCliOptions(
  projectRoot: string,
  projectName: string,
  appName: string,
): Rule {
  const rootPath = join(projectRoot as Path, projectName);
  const project = {
    type: PROJECT_TYPE.APPLICATION,
    root: rootPath,
    entryFile: 'main',
    sourceRoot: join(rootPath, DEFAULT_PATH_NAME),
    compilerOptions: {
      tsConfigPath: join(rootPath, 'tsconfig.app.json'),
    },
  };
  return (host: Tree) => {
    const nestFileExists = host.exists('nest.json');

    let nestCliFileExists = host.exists('nest-cli.json');
    if (!nestCliFileExists && !nestFileExists) {
      host.create('nest-cli.json', '{}');
      nestCliFileExists = true;
    }
    return updateJsonFile(
      host,
      nestCliFileExists ? 'nest-cli.json' : 'nest.json',
      (optionsFile: Record<string, any>) => {
        updateMainAppOptions(optionsFile, projectRoot, appName);
        if (!optionsFile.projects) {
          optionsFile.projects = {} as any;
        }
        if (optionsFile.projects[projectName]) {
          throw new SchematicsException(
            `Project "${projectName}" exists in this workspace already.`,
          );
        }
        optionsFile.projects[projectName] = project;
      },
    );
  };
}

function updateMainAppOptions(
  optionsFile: Record<string, any>,
  projectRoot: string,
  appName: string,
) {
  if (optionsFile.monorepo) {
    return;
  }
  const rootFilePath = join(projectRoot as Path, appName);
  const tsConfigPath = join(rootFilePath, 'tsconfig.app.json');

  optionsFile.monorepo = true;
  optionsFile.root = rootFilePath;
  optionsFile.sourceRoot = join(
    projectRoot as Path,
    appName,
    optionsFile.sourceRoot || DEFAULT_PATH_NAME,
  );
  if (!optionsFile.compilerOptions) {
    optionsFile.compilerOptions = {};
  }
  optionsFile.compilerOptions.webpack = true;
  optionsFile.compilerOptions.tsConfigPath = tsConfigPath;

  if (!optionsFile.projects) {
    optionsFile.projects = {} as any;
  }
  optionsFile.projects[appName] = {
    type: PROJECT_TYPE.APPLICATION,
    root: rootFilePath,
    entryFile: optionsFile.entryFile || 'main',
    sourceRoot: join(rootFilePath, DEFAULT_PATH_NAME),
    compilerOptions: {
      tsConfigPath,
    },
  };
}

function generateWorkspace(options: SubAppOptions, appName: string): Source {
  const path = join(options.path as Path, appName);
  return apply(url(join('./workspace' as Path, options.language)), [
    template({
      ...strings,
      ...options,
      name: appName,
    }),
    move(path),
  ]);
}

function generate(options: SubAppOptions): Source {
  const path = join(options.path as Path, options.name);
  return apply(url(join('./files' as Path, options.language)), [
    template({
      ...strings,
      ...options,
    }),
    move(path),
  ]);
}
