import { join, normalize, Path, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, Source, template, url } from '@angular-devkit/schematics';
import { Location, NameParser } from '../utils/name.parser';
import { GatewayOptions } from './schema';

export function main(options: GatewayOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(options: GatewayOptions): GatewayOptions {
  const target: GatewayOptions = Object.assign({}, options);
  target.path = target.path !== undefined ? join(normalize('src'), target.path) : normalize('src');
  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.path = strings.dasherize(location.path);
  return target;
}

function generate(options: GatewayOptions): Source {
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
