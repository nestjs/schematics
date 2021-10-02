import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  move,
  filter,
  Rule,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import { basename, parse } from 'path';
import { rename } from '../../utils/rename.rule';
import {
  DEFAULT_AUTHOR,
  DEFAULT_DESCRIPTION,
  DEFAULT_HTTP_PLATFORM_APP,
  DEFAULT_LANGUAGE,
  DEFAULT_VERSION,
} from './application.defaults';
import { ApplicationOptions } from './application.schema';

export function main(options: ApplicationOptions): Rule {
  options.name = strings.dasherize(options.name);

  const path =
    !options.directory || options.directory === 'undefined'
      ? options.name
      : options.directory;

  options = transform(options);
  return mergeWith(generate(options, path));
}

export function transform(options: ApplicationOptions): ApplicationOptions {
  const target: ApplicationOptions = Object.assign({}, options);

  target.author = !!target.author ? target.author : DEFAULT_AUTHOR;
  target.description = !!target.description
    ? target.description
    : DEFAULT_DESCRIPTION;
  target.language = !!target.language ? target.language : DEFAULT_LANGUAGE;
  target.name = resolvePackageName(target.name);
  target.version = !!target.version ? target.version : DEFAULT_VERSION;
  target.platform = !!target.platform
    ? target.platform
    : DEFAULT_HTTP_PLATFORM_APP;

  target.packageManager =
    !target.packageManager || target.packageManager === 'undefined'
      ? 'npm'
      : target.packageManager;
  target.dependencies = !!target.dependencies ? target.dependencies : '';
  target.devDependencies = !!target.devDependencies
    ? target.devDependencies
    : '';
  return target;
}

function resolvePackageName(path: string) {
  const { name } = parse(path);
  if (name === '.') {
    return basename(process.cwd());
  }
  return name;
}

function generate(options: ApplicationOptions, path: string): Source {
  const AVAILABE_HTTP_PLATFORMS = ['express', 'fastify'] as const;

  const pathExtsToExclude = AVAILABE_HTTP_PLATFORMS
    //
    .filter((platform) => platform !== options.platform)
    .map((platform) => '.' + platform);

  /**
   * @returns A rule to remove the platform-specific identifier from template
   * file path.
   */
  const removeHttpPlatformFromPathExt = (platform: string) => {
    const httpPlatformPathExt = '.' + platform;
    return rename(
      (templatePath) => templatePath.endsWith(httpPlatformPathExt),
      (templatePath) => templatePath.slice(0, -httpPlatformPathExt.length),
    );
  };

  const shouldIncludeFile = (path: string): boolean =>
    !pathExtsToExclude.some((ext) => path.endsWith(ext));

  return apply(url(join('./files' as Path, options.language)), [
    filter(shouldIncludeFile),
    removeHttpPlatformFromPathExt(options.platform),
    template({
      ...strings,
      ...options,
    }),
    move(path),
  ]);
}
