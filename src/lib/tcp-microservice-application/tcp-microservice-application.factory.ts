import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  move,
  Rule,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import {
  DEFAULT_AUTHOR,
  DEFAULT_DESCRIPTION,
  DEFAULT_LANGUAGE,
  DEFAULT_VERSION,
} from '../defaults';
import { TCPMicroserviceApplicationOptions } from './tcp-microservice-application.schema';

export function main(options: TCPMicroserviceApplicationOptions): Rule {
  options = transform(options);
  return mergeWith(generate(options));
}

function transform(options: TCPMicroserviceApplicationOptions): TCPMicroserviceApplicationOptions {
  const target: TCPMicroserviceApplicationOptions = Object.assign({}, options);

  target.author = !!target.author ? target.author : DEFAULT_AUTHOR;
  target.description = !!target.description
    ? target.description
    : DEFAULT_DESCRIPTION;
  target.language = !!target.language ? target.language : DEFAULT_LANGUAGE;
  target.name = strings.dasherize(target.name);
  target.version = !!target.version ? target.version : DEFAULT_VERSION;

  target.packageManager = !!target.packageManager
    ? target.packageManager
    : 'npm';
  target.dependencies = !!target.dependencies ? target.dependencies : '';
  target.devDependencies = !!target.devDependencies
    ? target.devDependencies
    : '';
  return target;
}

function generate(options: TCPMicroserviceApplicationOptions): Source {
  return apply(url(join('./files' as Path, options.language)), [
    template({
      ...strings,
      ...options,
    }),
    move(options.name),
  ]);
}
