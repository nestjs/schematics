import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  move,
  Rule,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import { MicroserviceApplicationOptions } from './options';

export function main(options: MicroserviceApplicationOptions): Rule {
  return create(parse(options));
}

export function parse(options: MicroserviceApplicationOptions): MicroserviceApplicationOptions {
  return {
    ...options,
    name: strings.dasherize(options.name),
  };
}

function create(options: MicroserviceApplicationOptions): Rule {
  return mergeWith(apply(createSource(options), createRules(options)));
}

function createSource(options: MicroserviceApplicationOptions): Source {
  return url(join('./files' as Path, options.language));
}

function createRules(options: MicroserviceApplicationOptions): Rule[] {
  return [
    template({
      ...strings,
      ...options,
    }),
    move(options.name),
  ];
}
