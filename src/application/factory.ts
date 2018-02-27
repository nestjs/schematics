import { strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { ApplicationOptions } from './schema';

export function main(options: ApplicationOptions): Rule {
  return mergeWith(
    apply(
      url('./files'),
      [
        template({
          ...strings,
          ...options
        }),
        move(options.path)
      ]
    )
  );
}
