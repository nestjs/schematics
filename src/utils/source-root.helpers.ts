import { join, normalize } from '@angular-devkit/core';
import { Rule, Tree } from '@angular-devkit/schematics';
import { DEFAULT_PATH_NAME } from '../lib/defaults';

export function isInRootDirectory(
  host: Tree,
  extraFiles: string[] = [],
): boolean {
  const files = ['nest-cli.json', 'nest.json'].concat(extraFiles || []);
  return files.map(file => host.exists(file)).some(isPresent => isPresent);
}

export function mergeSourceRoot<
  T extends { sourceRoot?: string; path?: string } = any
>(options: T): Rule {
  return (host: Tree) => {
    const isInRoot = isInRootDirectory(host, ['tsconfig.json', 'package.json']);
    if (!isInRoot) {
      return host;
    }
    const defaultSourceRoot =
      options.sourceRoot !== undefined ? options.sourceRoot : DEFAULT_PATH_NAME;

    options.path =
      options.path !== undefined
        ? join(normalize(defaultSourceRoot), options.path)
        : normalize(defaultSourceRoot);
    return host;
  };
}
