import { join, normalize, Path, strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  move,
  Rule,
  SchematicsException,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import { Location, NameParser } from '../../utils/name.parser';
import { DEFAULT_PATH_NAME } from '../defaults';
import { MiddlewareOptions } from './middleware.schema';

export function main(options: MiddlewareOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(options: MiddlewareOptions): MiddlewareOptions {
  const target: MiddlewareOptions = Object.assign({}, options);
  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }
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

function generate(options: MiddlewareOptions): Source {
  return apply(url(join('./files' as Path, options.language)), [
    template({
      ...strings,
      ...options,
    }),
    move(options.path),
  ]);
}
