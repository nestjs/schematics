import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  move,
  Rule,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import { basename, parse } from 'path';
import {
  DEFAULT_AUTHOR,
  DEFAULT_DESCRIPTION,
  DEFAULT_LANGUAGE,
  DEFAULT_VERSION,
} from '../defaults';
import { ApplicationOptions } from './application.schema';

export function main(options: ApplicationOptions): Rule {
  options.name = strings.dasherize(options.name);

  const path = options.name;
  options = transform(options);
  return mergeWith(generate(options, path));
}

function transform(options: ApplicationOptions): ApplicationOptions {
  const target: ApplicationOptions = Object.assign({}, options);

  target.author = !!target.author ? target.author : DEFAULT_AUTHOR;
  target.description = !!target.description
    ? target.description
    : DEFAULT_DESCRIPTION;
  target.language = !!target.language ? target.language : DEFAULT_LANGUAGE;
  target.name = resolvePackageName(target.name);
  target.version = !!target.version ? target.version : DEFAULT_VERSION;

  target.packageManager = !!target.packageManager
    ? target.packageManager
    : 'npm';
  target.dependencies = !!target.dependencies ? target.dependencies : '';
  target.devDependencies = !!target.devDependencies
    ? target.devDependencies
    : '';
  return target;
}

function resolvePackageName(path: string) {
  const { name } = parse(path);
  if (name === '.') {
    return basename(process.cwd());
  }
  return name;
}

function generate(options: ApplicationOptions, path: string): Source {
  return apply(url(join('./files' as Path, options.language)), [
    template({
      ...strings,
      ...options,
    }),
    move(path),
  ]);
}
