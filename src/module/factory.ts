import { strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { AssetOptions } from '../schemas';

export function main(options: AssetOptions): Rule {
  return mergeWith(
    apply(
      url('./files'),
      [
        template({
          ...strings,
          ...options,
        }),
        move(options.rootDir),
      ]
    ),
  );
}
