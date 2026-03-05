import { join, normalize, Path, strings } from '@angular-devkit/core';
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
import { parse } from 'jsonc-parser';
import {
  createModuleNameMapper,
  inPlaceSortByKeys,
  normalizeToKebabOrSnakeCase,
} from '../../utils/index.js';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_LIB_PATH,
  DEFAULT_PATH_NAME,
  PROJECT_TYPE,
} from '../defaults.js';
import type { LibraryOptions } from './library.schema.js';
import { FileSystemReader } from '../readers/index.js';

type UpdateJsonFn<T> = (obj: T) => T | void;
interface TsConfigPartialType {
  compilerOptions?: Record<string, any>;
  files?: string[];
  include?: string[];
  exclude?: string[];
  references?: Array<{ path: string }>;
}

export function main(options: LibraryOptions): Rule {
  options = transform(options);
  return chain([
    addLibraryToCliOptions(options.path, options.name),
    updatePackageJson(options),
    updateJestEndToEnd(options),
    updateTsConfig(options.name, options.prefix, options.path),
    branchAndMerge(mergeWith(generate(options))),
  ]);
}

function getDefaultLibraryPrefix(defaultLibraryPrefix = '@app') {
  const fileSystemReader = new FileSystemReader(process.cwd());
  const content: string | undefined = fileSystemReader.readSyncAnyOf([
    'nest-cli.json',
    '.nestcli.json',
    '.nest-cli.json',
    'nest.json',
  ]);

  try {
    const nestJson = JSON.parse(content || '{}');
    if (
      Object.prototype.hasOwnProperty.call(nestJson, 'defaultLibraryPrefix')
    ) {
      return nestJson['defaultLibraryPrefix'] as string;
    }
  } catch {
    return defaultLibraryPrefix;
  }

  return defaultLibraryPrefix;
}

function transform(options: LibraryOptions): LibraryOptions {
  const target: LibraryOptions = Object.assign({}, options);
  const defaultSourceRoot =
    options.rootDir !== undefined ? options.rootDir : DEFAULT_LIB_PATH;

  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }
  target.language = target.language ? target.language : DEFAULT_LANGUAGE;
  target.name = normalizeToKebabOrSnakeCase(target.name);
  target.path =
    target.path !== undefined
      ? join(normalize(defaultSourceRoot), target.path)
      : normalize(defaultSourceRoot);

  target.prefix = target.prefix || getDefaultLibraryPrefix();
  return target;
}

function updatePackageJson(options: LibraryOptions) {
  return (host: Tree) => {
    if (!host.exists('package.json')) {
      return host;
    }
    const distRoot = join(options.path as Path, options.name, 'src');
    const packageKey = options.prefix
      ? options.prefix + '/' + options.name
      : options.name;

    return updateJsonFile(
      host,
      'package.json',
      (packageJson: Record<string, Record<string, any>>) => {
        updateNpmScripts(packageJson.scripts, options);
        updateJestConfig(packageJson.jest, options, packageKey, distRoot);
      },
    );
  };
}

function updateJestConfig(
  jestOptions: Record<string, any>,
  options: LibraryOptions,
  packageKey: string,
  distRoot: string,
) {
  if (!jestOptions) {
    return;
  }
  if (jestOptions.rootDir === DEFAULT_PATH_NAME) {
    jestOptions.rootDir = '.';
    jestOptions.coverageDirectory = './coverage';
  }
  const defaultSourceRoot =
    options.rootDir !== undefined ? options.rootDir : DEFAULT_LIB_PATH;

  const jestSourceRoot = `<rootDir>/${defaultSourceRoot}/`;
  if (!jestOptions.roots) {
    jestOptions.roots = ['<rootDir>/src/', jestSourceRoot];
  } else if (jestOptions.roots.indexOf(jestSourceRoot) < 0) {
    jestOptions.roots.push(jestSourceRoot);
  }

  if (!jestOptions.moduleNameMapper) {
    jestOptions.moduleNameMapper = {};
  }
  const packageRoot = join('<rootDir>' as Path, distRoot);
  const newMapper = createModuleNameMapper(packageKey, packageRoot);
  Object.assign(jestOptions.moduleNameMapper, newMapper);

  inPlaceSortByKeys(jestOptions.moduleNameMapper);
}

function updateNpmScripts(
  scripts: Record<string, any>,
  options: LibraryOptions,
) {
  if (!scripts) {
    return;
  }
  const defaultFormatScriptName = 'format';
  if (!scripts[defaultFormatScriptName]) {
    return;
  }

  if (
    scripts[defaultFormatScriptName] &&
    scripts[defaultFormatScriptName].indexOf(DEFAULT_PATH_NAME) >= 0
  ) {
    const defaultSourceRoot =
      options.rootDir !== undefined ? options.rootDir : DEFAULT_LIB_PATH;
    scripts[defaultFormatScriptName] =
      `prettier --write "src/**/*.ts" "test/**/*.ts" "${defaultSourceRoot}/**/*.ts"`;
  }
}

function updateJestEndToEnd(options: LibraryOptions) {
  return (host: Tree) => {
    const pathToFile = join('test' as Path, 'jest-e2e.json');
    if (!host.exists(pathToFile)) {
      return host;
    }
    const distRoot = join(options.path as Path, options.name, 'src');
    const packageKey = options.prefix
      ? options.prefix + '/' + options.name
      : options.name;

    return updateJsonFile(
      host,
      pathToFile,
      (jestOptions: Record<string, any>) => {
        if (!jestOptions.moduleNameMapper) {
          jestOptions.moduleNameMapper = {};
        }
        const packageRoot = '<rootDir>/../' + distRoot;
        const newMapper = createModuleNameMapper(packageKey, packageRoot);
        Object.assign(jestOptions.moduleNameMapper, newMapper);

        inPlaceSortByKeys(jestOptions.moduleNameMapper);
      },
    );
  };
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
    host.overwrite(path, JSON.stringify(json, null, 2));
  }
  return host;
}

function updateTsConfig(
  packageName: string,
  _packagePrefix: string,
  root: string,
) {
  return (host: Tree) => {
    if (!host.exists('tsconfig.json')) {
      return host;
    }
    const refPath = `./${join(root as Path, packageName, 'tsconfig.lib.json')}`;

    return updateJsonFile(
      host,
      'tsconfig.json',
      (tsconfig: TsConfigPartialType) => {
        if (!tsconfig.compilerOptions) {
          tsconfig.compilerOptions = {};
        }
        // Remove deprecated baseUrl and paths
        delete tsconfig.compilerOptions.baseUrl;
        delete tsconfig.compilerOptions.paths;

        if (!tsconfig.references) {
          tsconfig.references = [];
        }
        const hasRef = tsconfig.references.some((ref) => ref.path === refPath);
        if (!hasRef) {
          tsconfig.references.push({ path: refPath });
        }
      },
    );
  };
}

function addLibraryToCliOptions(
  projectRoot: string,
  projectName: string,
): Rule {
  const rootPath = join(projectRoot as Path, projectName);
  const project = {
    type: PROJECT_TYPE.LIBRARY,
    root: rootPath,
    entryFile: 'index',
    sourceRoot: join(rootPath, 'src'),
    compilerOptions: {
      tsConfigPath: join(rootPath, 'tsconfig.lib.json'),
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
        if (!optionsFile.projects) {
          optionsFile.projects = {} as any;
        }
        if (!optionsFile.compilerOptions) {
          optionsFile.compilerOptions = {};
        }
        if (optionsFile.compilerOptions.builder === undefined) {
          optionsFile.compilerOptions.builder = 'rspack';
        }
        if (optionsFile.projects[projectName]) {
          throw new SchematicsException(
            `Project "${projectName}" exists in this workspace already.`,
          );
        }
        optionsFile.projects[projectName] = project;

        inPlaceSortByKeys(optionsFile.projects);
      },
    );
  };
}

function generate(options: LibraryOptions): Source {
  const path = join(options.path as Path, options.name);

  return apply(url(join('./files' as Path, options.language)), [
    template({
      ...strings,
      ...options,
    }),
    move(path),
  ]);
}
