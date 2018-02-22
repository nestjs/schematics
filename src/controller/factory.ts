import { classify } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { AssetOptions } from '../schemas';

export function main(options: AssetOptions): Rule {
  return mergeWith(
    apply(
      url('./files'),
      [
        template({
          classify,
          ...options
        }),
        move(options.rootDir),
      ]
    )
  );
}
