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
import { WebApplicationOptions } from './options';

export function main(options: WebApplicationOptions): Rule {
  return create(parse(options));
}

export function parse(options: WebApplicationOptions): WebApplicationOptions {
  return {
    ...options,
    name: strings.dasherize(options.name),
  };
}

function create(options: WebApplicationOptions): Rule {
  return mergeWith(apply(createSource(options), createRules(options)));
}

function createSource(options: WebApplicationOptions): Source {
  return url(join('./files' as Path, options.language));
}

function createRules(options: WebApplicationOptions): Rule[] {
  return [
    template({
      ...strings,
      ...options,
    }),
    move(options.name),
  ];
}
