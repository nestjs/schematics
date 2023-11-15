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
import { normalizeToCase } from '../../utils/formatting';
import { Location, NameParser } from '../../utils/name.parser';
import { mergeSourceRoot } from '../../utils/source-root.helpers';
import { InterceptorOptions } from './interceptor.schema';

export function main(options: InterceptorOptions): Rule {
  options = transform(options);
  return chain([mergeSourceRoot(options), mergeWith(generate(options))]);
}

function transform(options: InterceptorOptions): InterceptorOptions {
  const target: InterceptorOptions = Object.assign({}, options);
  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }
  const location: Location = new NameParser().parse(target);
  target.name = normalizeToCase(location.name, 'kebab-or-snake');
  target.path = normalizeToCase(location.path, 'kebab-or-snake');
  target.language = target.language !== undefined ? target.language : 'ts';
  target.specFileSuffix = normalizeToCase(
    options.specFileSuffix || 'spec',
    'kebab-or-snake'
  );

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name);
  return target;
}

function generate(options: InterceptorOptions): Source {
  return (context: SchematicContext) =>
    apply(url(join('./files' as Path, options.language)), [
      options.spec ? noop() : filter((path) => !path.endsWith('.spec.ts')),
      options.spec
        ? noop()
        : filter((path) => {
            const languageExtension = options.language || 'ts';
            const suffix = `.__specFileSuffix__.${languageExtension}`;
            return !path.endsWith(suffix)
        }),
      template({
        ...strings,
        ...options,
      }),
      move(options.path),
    ])(context);
}
