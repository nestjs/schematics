import { join, normalize } from '@angular-devkit/core';
import { Rule, Tree } from '@angular-devkit/schematics';
import { DEFAULT_PATH_NAME } from '../lib/defaults';

/**
 * Checks if the current directory is the root directory.
 *
 * @param host - The file tree representing the project.
 * @param extraFiles - Additional files to check for in the root directory.
 * @returns True if the current directory is the root directory, otherwise false.
 */
export function isInRootDirectory(
  host: Tree,
  extraFiles: string[] = [],
): boolean {
  const files = ['nest-cli.json', 'nest.json'].concat(extraFiles || []);
  return files.map((file) => host.exists(file)).some((isPresent) => isPresent);
}

/**
 * Merges the source root with the provided options.
 * @param options - The options to merge with the source root.
 * @returns A rule to merge the source root with the provided options.
 */
export function mergeSourceRoot<
  T extends { sourceRoot?: string; path?: string } = any,
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
