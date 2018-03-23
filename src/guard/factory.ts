import { strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { GuardOptions } from './schema';

export function main(options: GuardOptions): Rule {
  return mergeWith(
    apply(
      url('./files'), [
        template({
          ...strings,
          ...options
        }),
        move('/src')
      ]
    )
  );
}
