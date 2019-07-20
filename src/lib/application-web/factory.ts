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
import { DefaultOption } from './constantes';
import { ApplicationWebOptions } from './options';

export function main(options: ApplicationWebOptions): Rule {
  return generateRuleWith(parse(options));
}

export function parse(options: ApplicationWebOptions): ApplicationWebOptions {
  return handleNameIn({
    ...generateDefaultOptions(),
    ...options,
  });
}

function generateDefaultOptions(): ApplicationWebOptions {
  return {
    author: DefaultOption.AUTHOR,
    description: DefaultOption.DESCRIPTION,
    dependencies: '',
    devDependencies: '',
    language: DefaultOption.LANGUAGE,
    name: '',
    packageManager: DefaultOption.PACKAGE_MANAGER,
    version: DefaultOption.VERSION,
  };
}

function handleNameIn(options: ApplicationWebOptions): ApplicationWebOptions {
  return {
    ...options,
    name: strings.dasherize(options.name),
  };
}

function generateRuleWith(options: ApplicationWebOptions): Rule {
  return mergeWith(apply(createSource(options), applyRules(options)));
}

function createSource(options: ApplicationWebOptions): Source {
  return url(join('./files' as Path, options.language));
}

function applyRules(options: ApplicationWebOptions): Rule[] {
  return [
    template({
      ...strings,
      ...options,
    }),
    move(options.name),
  ];
}
