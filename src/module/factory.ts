import { strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { ModuleOptions } from './schema';

export function main(options: ModuleOptions): Rule {
  options.path = options.path !== undefined && options.path !== null ? options.path : 'app';
  options.sourceDir = options.sourceDir !== undefined && options.sourceDir !== null ? options.sourceDir : 'src';
  return mergeWith(
    apply(
      url('./files'), [
        template({
          ...strings,
          ...options
        }),
        move(options.sourceDir)
      ]
    )
  );
}
