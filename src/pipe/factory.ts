import { join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { Location, NameParser } from '../utils/name.parser';
import { PipeOptions } from './schema';
import { dasherize } from '@angular-devkit/core/src/utils/strings';

export function main(options: PipeOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(source: PipeOptions): PipeOptions {
  let target: PipeOptions = Object.assign({}, source);
  target.path = target.path !== undefined ? join(normalize('src'), target.path) : normalize('src');
  const location: Location = new NameParser().parse(target);
  target.name = location.name;
  target.path = location.path;
  return target;
}

function generate(options: PipeOptions) {
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
