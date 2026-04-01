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
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting.js';
import { Location, NameParser } from '../../utils/name.parser.js';
import {
  isEsmProject,
  mergeSourceRoot,
} from '../../utils/source-root.helpers.js';
import type { GuardOptions } from './guard.schema.js';

export function main(options: GuardOptions): Rule {
  options = transform(options);
  return chain([
    mergeSourceRoot(options),
    (tree) => {
      (options as any).isEsm = isEsmProject(tree);
      return tree;
    },
    mergeWith(generate(options)),
  ]);
}

function transform(options: GuardOptions): GuardOptions {
  const target: GuardOptions = Object.assign({}, options);
  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }
  const location: Location = new NameParser().parse(target);
  target.name = normalizeToKebabOrSnakeCase(location.name);
  target.path = normalizeToKebabOrSnakeCase(location.path);
  target.language = target.language !== undefined ? target.language : 'ts';
  target.specFileSuffix = normalizeToKebabOrSnakeCase(
    options.specFileSuffix || 'spec',
  );

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name);
  return target;
}

function generate(options: GuardOptions): Source {
  return (context: SchematicContext) =>
    apply(url(join('./files' as Path, options.language!)), [
      options.spec
        ? noop()
        : filter((path) => {
            const languageExtension = options.language || 'ts';
            const suffix = `.__specFileSuffix__.${languageExtension}`;
            return !path.endsWith(suffix);
          }),
      template({
        ...strings,
        ...options,
      }),
      move(options.path!),
    ])(context);
}
