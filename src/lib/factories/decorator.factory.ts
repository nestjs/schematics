import { join, normalize, Path, strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  move,
  Rule,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import { Location, NameParser } from '../../utils/name.parser';
import { DEFAULT_PATH_NAME } from '../defaults';
import { DecoratorOptions } from './decorator.schema';

export function main(options: DecoratorOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(options: DecoratorOptions): DecoratorOptions {
  const target: DecoratorOptions = Object.assign({}, options);
  const defaultSourceRoot =
    options.sourceRoot !== undefined ? options.sourceRoot : DEFAULT_PATH_NAME;
  target.path =
    target.path !== undefined
      ? join(normalize(defaultSourceRoot), target.path)
      : normalize(defaultSourceRoot);

  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.path = join(strings.dasherize(location.path) as Path, target.name);
  target.language = target.language !== undefined ? target.language : 'ts';
  return target;
}

function generate(options: DecoratorOptions): Source {
  return apply(
    url(join('../../templates' as Path, options.language, 'decorator')),
    [
      template({
        ...strings,
        ...options,
      }),
      move(options.path),
    ],
  );
}
