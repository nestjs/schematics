import { join, Path, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, Source, template, url } from '@angular-devkit/schematics';
import { ApplicationOptions } from './application.schema';

const DEFAULT_AUTHOR = '';
const DEFAULT_DESCRIPTION = '';
const DEFAULT_LANGUAGE = 'ts';
const DEFAULT_VERSION = '1.0.0';

export function main(options: ApplicationOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(options: ApplicationOptions): ApplicationOptions {
  const target: ApplicationOptions = Object.assign({}, options);
  target.author = !!target.author ? target.author : DEFAULT_AUTHOR;
  target.description = !!target.description ? target.description : DEFAULT_DESCRIPTION;
  target.language = !!target.language ? target.language : DEFAULT_LANGUAGE;
  target.name = strings.dasherize(target.name);
  target.version = !!target.version ? target.version : DEFAULT_VERSION;
  target.packageManager = !!target.packageManager ? target.packageManager : 'npm';
  target.dependencies = !!target.dependencies ? target.dependencies : '';
  target.devDependencies = !!target.devDependencies ? target.devDependencies : '';
  return target;
}

function generate(options: ApplicationOptions): Source {
  return apply(
    url(join('../../templates' as Path, options.language, 'application')),
    [
      template({
        ...strings,
        ...options
      }),
      move(options.name)
    ]
  );
}
