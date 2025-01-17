/**
 * This file has been moved to the "@nestjs/schematics" to avoid pulling the entire "@schematics/angular" into Nest projects.
 * REF https://github.com/angular/angular-cli/blob/master/packages/schematics/angular/utility/dependencies.ts
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Tree } from '@angular-devkit/schematics';
import { JSONFile } from './json-file.util';

const PKG_JSON_PATH = '/package.json';
export enum NodeDependencyType {
  Default = 'dependencies',
  Dev = 'devDependencies',
  Peer = 'peerDependencies',
  Optional = 'optionalDependencies',
}

export interface NodeDependency {
  type: NodeDependencyType;
  name: string;
  version: string;
  overwrite?: boolean;
}

const ALL_DEPENDENCY_TYPE = [
  NodeDependencyType.Default,
  NodeDependencyType.Dev,
  NodeDependencyType.Optional,
  NodeDependencyType.Peer,
];

/**
 * Adds a dependency to the package.json file.
 *
 * @param tree - The file tree representing the project.
 * @param dependency - The dependency to add, including type, name, and version.
 * @param pkgJsonPath - The path to the package.json file. Defaults to PKG_JSON_PATH.
 */
export function addPackageJsonDependency(
  tree: Tree,
  dependency: NodeDependency,
  pkgJsonPath = PKG_JSON_PATH,
): void {
  const json = new JSONFile(tree, pkgJsonPath);

  const { overwrite, type, name, version } = dependency;
  const path = [type, name];
  if (overwrite || !json.get(path)) {
    json.modify(path, version);
  }
}

/**
 * Retrieves the dependency information from the package.json file.
 *
 * @param tree - The file tree to read from.
 * @param name - The name of the dependency to find.
 * @param pkgJsonPath - The path to the package.json file (optional, defaults to PKG_JSON_PATH).
 * @returns The dependency information if found, otherwise null.
 */
export function getPackageJsonDependency(
  tree: Tree,
  name: string,
  pkgJsonPath = PKG_JSON_PATH,
): NodeDependency | null {
  const json = new JSONFile(tree, pkgJsonPath);

  for (const depType of ALL_DEPENDENCY_TYPE) {
    const version = json.get([depType, name]);

    if (typeof version === 'string') {
      return {
        type: depType,
        name: name,
        version,
      };
    }
  }

  return null;
}
