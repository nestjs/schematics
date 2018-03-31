import { join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { Location, NameParser } from '../utils/name.parser';
import { GuardOptions } from './schema';

export function main(options: GuardOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(source: GuardOptions): GuardOptions {
  let target: GuardOptions = Object.assign({}, source);
  target.path = target.path !== undefined ? join(normalize('src'), target.path) : normalize('src');
  const location: Location = new NameParser().parse(target);
  target.name = location.name;
  target.path = location.path;
  return target;
}

function generate(options: GuardOptions) {
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
