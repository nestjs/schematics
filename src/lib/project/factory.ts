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
import { ProjectOptions } from './options';

export function main(options: ProjectOptions): Rule {
  return mergeWith(apply(createSource(options), createRules(options)));
}

export function parse(options: ProjectOptions): ProjectOptions {
  return {
    ...options,
    name: strings.dasherize(options.name),
  };
}

function createSource(options: ProjectOptions): Source {
  return url(join('./files' as Path, options.language));
}

function createRules(options: ProjectOptions): Rule[] {
  return [
    template({
      ...strings,
      ...options,
    }),
    move(options.name),
  ];
}
