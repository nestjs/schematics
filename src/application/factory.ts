import { strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, Source, template, url } from '@angular-devkit/schematics';
import { ApplicationOptions } from './schema';
import { dasherize } from '@angular-devkit/core/src/utils/strings';

export function main(options: ApplicationOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(options: ApplicationOptions): ApplicationOptions {
  const target: ApplicationOptions = Object.assign({}, options);
  target.name = dasherize(options.name);
  return target;
}

function generate(options: ApplicationOptions): Source {
  return apply(
    url('./files'),
    [
      template({
        ...strings,
        ...options
      }),
      move(options.name)
    ]
  );
}
