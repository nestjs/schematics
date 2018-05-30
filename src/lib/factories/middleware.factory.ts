import { join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, Source, template, url } from '@angular-devkit/schematics';
import { Location, NameParser } from '../../utils/name.parser';
import { MiddlewareOptions } from './middleware.schema';

export function main(options: MiddlewareOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(options: MiddlewareOptions): MiddlewareOptions {
  const target: MiddlewareOptions = Object.assign({}, options);
  target.path = target.path !== undefined ? join(normalize('src'), target.path) : normalize('src');
  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.path = join(strings.dasherize(location.path) as Path, target.name);
  target.language = target.language !== undefined ? target.language : 'ts';
  return target;
}

function generate(options: MiddlewareOptions): Source {
  return apply(
    url(join('../../templates' as Path, options.language, 'middleware')), [
      template({
        ...strings,
        ...options
      }),
      move(options.path)
    ]
  );
}
