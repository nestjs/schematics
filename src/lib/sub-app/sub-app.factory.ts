import {
  join,
  normalize,
  parseJson,
  Path,
  strings,
} from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicsException,
  Source,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as fse from 'fs-extra';
import {
  ALTERNATIVE_DIR_ENTRY_APP,
  DEFAULT_APPS_PATH,
  DEFAULT_DIR_ENTRY_APP,
  DEFAULT_LANGUAGE,
  DEFAULT_LIB_PATH,
  DEFAULT_PATH_NAME,
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
  const defaultAppName =
    options.name === DEFAULT_DIR_ENTRY_APP
      ? ALTERNATIVE_DIR_ENTRY_APP
      : DEFAULT_DIR_ENTRY_APP;

  options = transform(options);
  return chain([
    updateTsConfig(),
    updatePackageJson(options, defaultAppName),
    addSubAppToCliOptions(options.path, options.name, defaultAppName),
    branchAndMerge(mergeWith(generateWorkspace(options, defaultAppName))),
    moveDefaultAppToApps(options.path, defaultAppName, options.sourceRoot),
    branchAndMerge(mergeWith(generate(options))),
  ]);
}

function transform(options: SubAppOptions): SubAppOptions {
  const target: SubAppOptions = Object.assign({}, options);
  const defaultSourceRoot =
    options.rootDir !== undefined ? options.rootDir : DEFAULT_APPS_PATH;

  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }
  target.language = !!target.language ? target.language : DEFAULT_LANGUAGE;
  target.name = strings.dasherize(target.name);
  target.path =
    target.path !== undefined
      ? join(normalize(defaultSourceRoot), target.path)
      : normalize(defaultSourceRoot);

  return target;
}

function updateJsonFile<T>(
  host: Tree,
  path: string,
  callback: UpdateJsonFn<T>,
): Tree {
  const source = host.read(path);
  if (source) {
    const sourceText = source.toString('utf-8');
    const json = parseJson(sourceText);
    callback((json as {}) as T);
    host.overwrite(path, JSON.stringify(json, null, 2));
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
        // tslint:disable:no-unused-expression
        packageJson.scripts &&
          updateNpmScripts(packageJson.scripts, options, defaultAppName);
        packageJson.jest && updateJestOptions(packageJson.jest, options);
      },
    );
  };
}

function updateNpmScripts(
  scripts: Record<string, any>,
  options: SubAppOptions,
  defaultAppName: string,
) {
  const defaultFormatScriptName = 'format';
  const defaultTestScriptName = 'test:e2e';
  if (!scripts[defaultTestScriptName] && !scripts[defaultFormatScriptName]) {
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
    scripts[defaultTestScriptName] = (scripts[
      defaultTestScriptName
    ] as string).replace(defaultTestDir, newTestDir);
  }
  if (
    scripts[defaultFormatScriptName] &&
    scripts[defaultFormatScriptName].indexOf(DEFAULT_PATH_NAME) >= 0
  ) {
    scripts[defaultFormatScriptName] =
      'prettier --write "apps/**/*.ts" "libs/**/*.ts"';
  }
}

function updateJestOptions(jest: Record<string, any>, options: SubAppOptions) {
  if (jest.rootDit !== options.sourceRoot) {
    return;
  }
  jest.rootDir = '.';
  jest.roots = [
    `<rootDir>/${options.sourceRoot}/`,
    `<rootDir>/${DEFAULT_LIB_PATH}/`,
    `<rootDir>/${options.path}/`,
  ];
  jest.coverageDirectory = './coverage';
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
    if (fse.existsSync(sourceRoot)) {
      fse.moveSync(sourceRoot, join(projectRoot as Path, appName, sourceRoot));
    }
    const testDir = 'test';
    if (fse.existsSync(testDir)) {
      fse.moveSync(testDir, join(projectRoot as Path, appName, testDir));
    }
    return host;
  };
}

function addSubAppToCliOptions(
  projectRoot: string,
  projectName: string,
  appName: string,
): Rule {
  const project = {
    root: join(projectRoot as Path, projectName),
    sourceRoot: join(projectRoot as Path, projectName, DEFAULT_PATH_NAME),
  };
  return (host: Tree) => {
    const nestCliFileExists = host.exists('nest-cli.json');
    const nestFileExists = host.exists('nest.json');

    if (!nestCliFileExists && !nestFileExists) {
      return host;
    }
    return updateJsonFile(
      host,
      nestCliFileExists ? 'nest-cli.json' : 'nest.json',
      (optionsFile: Record<string, any>) => {
        if (!optionsFile.projects) {
          optionsFile.projects = {} as any;
        }
        optionsFile.projects[projectName] = project;

        // Update initial application options
        if (
          optionsFile.sourceRoot &&
          optionsFile.sourceRoot.indexOf(projectRoot) >= 0
        ) {
          return;
        }
        optionsFile.sourceRoot = join(
          projectRoot as Path,
          appName,
          optionsFile.sourceRoot || DEFAULT_PATH_NAME,
        );
      },
    );
  };
}

function generateWorkspace(options: SubAppOptions, appName: string): Source {
  const path = join(options.path as Path, appName);

  return apply(url(join('./workspace' as Path, options.language)), [
    template({
      ...strings,
      ...options,
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
