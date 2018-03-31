import { join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, Source, template, url } from '@angular-devkit/schematics';
import { ExceptionOptions } from './schema';
import { Location, NameParser } from '../utils/name.parser';

export function main(options: ExceptionOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(options: ExceptionOptions): ExceptionOptions {
  const target = Object.assign({}, options);
  target.path = target.path !== undefined ? join(normalize('src'), target.path) : normalize('src');
  const location: Location = new NameParser().parse(target);
  target.name = location.name;
  target.path = location.path;
  return target;
}

function generate(options: ExceptionOptions): Source {
  return apply(
    url('./files'), [
      template({
        ...strings,
        ...options
      }),
      move(join(options.path as Path, options.name))
    ]
  );
}
