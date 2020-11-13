import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  SchematicsException,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import { Location, NameParser } from '../../utils/name.parser';
import { mergeSourceRoot } from '../../utils/source-root.helpers';
import { EntityOptions } from './entity.schema';

export function main(options: EntityOptions): Rule {
  options = transform(options);
  return chain([mergeSourceRoot(options), mergeWith(generate(options))]);
}

function transform(options: EntityOptions): EntityOptions {
  const target: EntityOptions = Object.assign({}, options);
  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }
  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.path = strings.dasherize(location.path);

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name);
  return target;
}

function generate(options: EntityOptions): Source {
  return (context: SchematicContext) =>
    apply(url('./files'), [
      template({
        ...strings,
        ...options,
      }),
      move(options.path),
    ])(context);
}
