import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks/index.js';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
  NodeDependencyType,
} from './dependencies.utils.js';
import { findNestCliConfigPath, readJsonFile } from './nest-cli-config.util.js';

/**
 * What the CLI's Rspack builder loads from the project. The CLI declares them
 * as optional peer dependencies and fails the build without them.
 */
export const RSPACK_DEV_DEPENDENCIES: Record<string, string> = {
  '@rspack/core': '^2.1.10',
  'tsconfig-paths-webpack-plugin': '^4.2.0',
  'webpack-node-externals': '^3.0.0',
};

function builderType(compilerOptions: any): unknown {
  const builder = compilerOptions?.builder;
  return typeof builder === 'string' ? builder : builder?.type;
}

/**
 * Whether `nest-cli.json` builds the workspace, or one of its projects, with
 * Rspack.
 */
export function usesRspackBuilder(tree: Tree): boolean {
  const configPath = findNestCliConfigPath(tree);
  const config = configPath ? readJsonFile(tree, configPath) : null;
  if (!config) {
    return false;
  }
  const projects = Object.values<any>(config.projects ?? {});
  return [config, ...projects].some(
    (target) => builderType(target?.compilerOptions) === 'rspack',
  );
}

/**
 * Adds the Rspack builder's packages that `package.json` does not list yet to
 * its `devDependencies`, and returns their names.
 */
export function addMissingRspackDependencies(tree: Tree): string[] {
  if (!tree.exists('package.json')) {
    return [];
  }
  const added: string[] = [];
  for (const [name, version] of Object.entries(RSPACK_DEV_DEPENDENCIES)) {
    if (!getPackageJsonDependency(tree, name)) {
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Dev,
        name,
        version,
      });
      added.push(name);
    }
  }
  return added;
}

/**
 * Adds the Rspack builder's packages to `devDependencies` when the workspace
 * builds with Rspack, and installs them.
 */
export function addRspackDependencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (
      usesRspackBuilder(tree) &&
      addMissingRspackDependencies(tree).length > 0
    ) {
      context.addTask(new NodePackageInstallTask());
    }
    return tree;
  };
}
