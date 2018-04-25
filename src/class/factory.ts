import { join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, Source, template, url } from '@angular-devkit/schematics';
import { Location, NameParser } from '../utils/name.parser';
import { ClassOptions } from './schema';

const DEFAULT_PATH_NAME = 'src';
const DEFAULT_LANGUAGE = 'ts';

export function main(options: ClassOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(options: ClassOptions): ClassOptions {
  const target: ClassOptions = Object.assign({}, options);
  target.path = target.path !== undefined ?
    join(normalize(DEFAULT_PATH_NAME), target.path) : normalize(DEFAULT_PATH_NAME);
  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.path = strings.dasherize(location.path);
  target.language = target.language !== undefined ? target.language : DEFAULT_LANGUAGE;
  return target;
}

function generate(options: ClassOptions): Source {
  return apply(
    url(join('files' as Path, options.language)), [
      template({
        ...strings,
        ...options
      }),
      move(join(options.path as Path, options.name))
    ]
  );
}
