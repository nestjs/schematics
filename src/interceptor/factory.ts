import { join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { Location, NameParser } from '../utils/name.parser';
import { InterceptorOptions } from './schema';

export function main(options: InterceptorOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(source: InterceptorOptions): InterceptorOptions {
  let target: InterceptorOptions = Object.assign({}, source);
  target.path = target.path !== undefined ? join(normalize('src'), target.path) : normalize('src');
  const location: Location = new NameParser().parse(target);
  target.name = location.name;
  target.path = location.path;
  return target;
}

function generate(options: InterceptorOptions) {
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
