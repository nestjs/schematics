import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { ControllerOptions } from './schema';

export function main(options: ControllerOptions): Rule {
  return chain([
    mergeWith(generate(options))
  ]);
}

function generate(options: ControllerOptions) {
  return apply(
    url('./files'), [
      template({
        ...strings,
        ...options
      }),
      move('/src')
    ]
  );
}
