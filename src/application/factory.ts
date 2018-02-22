import { classify } from '@angular-devkit/core';
import { apply, mergeWith, Rule, template, url } from '@angular-devkit/schematics';
import { ApplicationOptions } from '../schemas';

export function main(options: ApplicationOptions): Rule {
  return mergeWith(
    apply(
      url('./files'),
      [
        template({
          classify,
          ...options
        })
      ]
    )
  );
}
