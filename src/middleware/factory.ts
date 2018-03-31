import { join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { Location, NameParser } from '../utils/name.parser';
import { MiddlewareOptions } from './schema';
import { dasherize } from '@angular-devkit/core/src/utils/strings';

export function main(options: MiddlewareOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(source: MiddlewareOptions): MiddlewareOptions {
  let target: MiddlewareOptions = Object.assign({}, source);
  target.path = target.path !== undefined ? join(normalize('src'), target.path) : normalize('src');
  const location: Location = new NameParser().parse(target);
  target.name = location.name;
  target.path = location.path;
  return target;
}

function generate(options: MiddlewareOptions) {
  return apply(
    url('./files'), [
      template({
        ...strings,
        ...options
      }),
      move(join(options.path as Path, dasherize(options.name)))
    ]
  );
}
