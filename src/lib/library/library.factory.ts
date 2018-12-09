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
import { DEFAULT_LANGUAGE, DEFAULT_LIB_PATH } from '../defaults';
import { LibraryOptions } from './library.schema';

type UpdateJsonFn<T> = (obj: T) => T | void;
interface TsConfigPartialType {
  compilerOptions: {
    baseUrl: string;
    paths: {
      [key: string]: string[];
    };
  };
}

export function main(options: LibraryOptions): Rule {
  options = transform(options);
  return chain([
    updateTsConfig(options.name, options.path),
    addLibraryToCliOptions(options.path, options.name),
    branchAndMerge(mergeWith(generate(options))),
  ]);
}

function transform(options: LibraryOptions): LibraryOptions {
  const target: LibraryOptions = Object.assign({}, options);
  const defaultSourceRoot =
    options.rootDir !== undefined ? options.rootDir : DEFAULT_LIB_PATH;

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

function updateTsConfig(packageName: string, root: string) {
  return (host: Tree) => {
    if (!host.exists('tsconfig.json')) {
      return host;
    }
    const distRoot = join(root as Path, packageName, 'src');
    return updateJsonFile(
      host,
      'tsconfig.json',
      (tsconfig: TsConfigPartialType) => {
        if (!tsconfig.compilerOptions) {
          tsconfig.compilerOptions = {} as any;
        }
        if (!tsconfig.compilerOptions.paths) {
          tsconfig.compilerOptions.paths = {};
        }
        if (!tsconfig.compilerOptions.paths[packageName]) {
          tsconfig.compilerOptions.paths[packageName] = [];
        }
        tsconfig.compilerOptions.paths[packageName].push(distRoot);

        const deepPackagePath = packageName + '/*';
        if (!tsconfig.compilerOptions.paths[deepPackagePath]) {
          tsconfig.compilerOptions.paths[deepPackagePath] = [];
        }
        tsconfig.compilerOptions.paths[deepPackagePath].push(distRoot + '/*');
      },
    );
  };
}

function addLibraryToCliOptions(
  projectRoot: string,
  projectName: string,
): Rule {
  const project = {
    root: join(projectRoot as Path, projectName),
    sourceRoot: join(projectRoot as Path, projectName, 'src'),
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
