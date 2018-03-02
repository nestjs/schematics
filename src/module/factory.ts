import { strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { ModuleOptions } from './schema';

export function main(options: ModuleOptions): Rule {
  return mergeWith(
    apply(
      url('./files'), [
        template({
          ...strings,
          ...options
        }),
        move(options.rootDir)
      ]
    )
  );
}
