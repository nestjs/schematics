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
import { ContextApplicationOptions } from './options';

export function main(options: ContextApplicationOptions): Rule {
  return create(parse(options));
}

export function parse(options: ContextApplicationOptions): ContextApplicationOptions {
  return {
    ...options,
    name: strings.dasherize(options.name),
  };
}

function create(options: ContextApplicationOptions): Rule {
  return mergeWith(apply(createSource(options), createRules(options)));
}

function createSource(options: ContextApplicationOptions): Source {
  return url(join('./files' as Path, options.language));
}

function createRules(options: ContextApplicationOptions): Rule[] {
  return [
    template({
      ...strings,
      ...options,
    }),
    move(options.name),
  ];
}
