import { ConfigurationOptions } from './schema';
import { Rule, Tree, Source, apply, url, template, mergeWith } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

export function main(options: ConfigurationOptions): Rule {
  return mergeWith(generate(transform(options)));
}

function transform(options: ConfigurationOptions): ConfigurationOptions {
  const target: ConfigurationOptions = Object.assign({}, options);
  target.language = target.language !== undefined ? target.language : 'ts';
  target.collection = target.collection !== undefined ? target.collection : '@nestjs/schematics'
  return target;
}

function generate(options: ConfigurationOptions): Source {
  return apply(
    url('./files'),
    [
      template({
        ...strings,
        ...options
      })
    ]
  );
}
