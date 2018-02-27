import { strings } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import * as path from 'path';
import { PipeOptions } from './schema';

export function main(options: PipeOptions): Rule {
  return mergeWith(
    apply(
      url('./files'), [
        template({
          ...strings,
          ...options
        }),
        move(path.join(options.rootDir, options.path))
      ]
    )
  );
}
