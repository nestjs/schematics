import { join, Path, strings  } from '@angular-devkit/core';
import { apply, mergeWith, move, Rule, Source, template, url } from '@angular-devkit/schematics';
import { ConfigurationOptions } from './configuration.schema';
import { DEFAULT_LANGUAGE } from '../defaults';

export function main(options: ConfigurationOptions): Rule {
  return mergeWith(generate(transform(options)));
}

function transform(options: ConfigurationOptions): ConfigurationOptions {
  const target: ConfigurationOptions = Object.assign({}, options);
  target.language = target.language !== undefined ? target.language : DEFAULT_LANGUAGE;
  target.collection = target.collection !== undefined ? target.collection : '@nestjs/schematics';
  return target;
}

function generate(options: ConfigurationOptions): Source {
  return apply(
    url(join('./files' as Path, options.language)),
    [
      template({
        ...strings,
        ...options
      }),
      move(options.project)
    ]
  );
}
