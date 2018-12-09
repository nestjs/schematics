import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import { Location, NameParser } from '../../utils/name.parser';
import { mergeSourceRoot } from '../../utils/source-root.helpers';
import { DEFAULT_LANGUAGE } from '../defaults';
import { ClassOptions } from './class.schema';

export function main(options: ClassOptions): Rule {
  options = transform(options);
  return chain([mergeSourceRoot(options), mergeWith(generate(options))]);
}

function transform(options: ClassOptions): ClassOptions {
  const target: ClassOptions = Object.assign({}, options);
  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }
  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.language =
    target.language !== undefined ? target.language : DEFAULT_LANGUAGE;

  target.path = strings.dasherize(location.path);
  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name);

  return target;
}

function generate(options: ClassOptions): Source {
  return (context: SchematicContext) =>
    apply(url(join('./files' as Path, options.language)), [
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      template({
        ...strings,
        ...options,
      }),
      move(options.path),
    ])(context);
}
