import { strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { ServiceOptions } from './schema';

export function main(options: ServiceOptions): Rule {
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
