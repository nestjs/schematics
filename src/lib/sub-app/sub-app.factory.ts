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
  DEFAULT_APPS_PATH,
  DEFAULT_LANGUAGE,
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
  options = transform(options);
  return chain([
    updateTsConfig(),
    addSubAppToCliOptions(options.path, options.name),
    moveDefaultAppToApps(options.path),
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

function moveDefaultAppToApps(projectRoot: string): Rule {
  return (host: Tree) => {
    const nestCliFileExists = host.exists('nest-cli.json');
    const nestFileExists = host.exists('nest.json');

    let sourceRoot: string;
    if (!nestCliFileExists && !nestFileExists) {
      sourceRoot = DEFAULT_PATH_NAME;
    } else {
      const source = host.read(
        nestCliFileExists ? 'nest-cli.json' : 'nest.json',
      );
      if (source) {
        const sourceText = source.toString('utf-8');
        const config = parseJson(sourceText) as Record<string, any>;
        sourceRoot = (config && config.sourceRoot) || DEFAULT_PATH_NAME;
      }
    }
    if (fse.existsSync(sourceRoot) && process.env.NODE_ENV !== TEST_ENV) {
      fse.moveSync(sourceRoot, join(projectRoot as Path, sourceRoot));
    }
    return host;
  };
}

function addSubAppToCliOptions(projectRoot: string, projectName: string): Rule {
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

        // Update initial application options
        optionsFile.sourceRoot = join(
          projectRoot as Path,
          optionsFile.sourceRoot || DEFAULT_PATH_NAME,
        );
      },
    );
  };
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
