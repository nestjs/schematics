import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks/index.js';
import {
  addPackageJsonDependency,
  detectPackageManager,
  getPackageJsonDependency,
  NodeDependencyType,
} from './dependencies.utils.js';
import { findNestCliConfigPath, readJsonFile } from './nest-cli-config.util.js';

/**
 * What the CLI's Rspack builder loads from the project. The CLI declares them
 * as optional peer dependencies and fails the build without all but
 * `fork-ts-checker-webpack-plugin`, without which it silently skips type
 * checking (CLI 11 bundled it).
 */
export const RSPACK_DEV_DEPENDENCIES: Record<string, string> = {
  '@rspack/core': '^2.1.10',
  'fork-ts-checker-webpack-plugin': '^9.1.0',
  'tsconfig-paths-webpack-plugin': '^4.2.0',
  'webpack-node-externals': '^3.0.0',
};

/**
 * The CLI's peer dependency ranges, where they are wider than the version
 * added to new projects.
 */
const RSPACK_PEER_RANGES: Record<string, string> = {
  '@rspack/core': '^1.7.7 || ^2.1.10',
};

export interface IncompatibleRspackDependency {
  name: string;
  current: string;
  required: string;
}

export interface RspackDependenciesResult {
  /** Packages added to `devDependencies`. */
  added: string[];
  /** Packages already listed at a major the CLI does not support. */
  incompatible: IncompatibleRspackDependency[];
}

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

function isJavaScriptProject(tree: Tree, language?: string): boolean {
  if (language === 'js') {
    return true;
  }
  const configPath = findNestCliConfigPath(tree);
  return (
    (configPath ? readJsonFile(tree, configPath) : null)?.language === 'js'
  );
}

/**
 * Whether `current` can resolve to a major that one of the `||` alternatives
 * of `required` accepts. Only plain versions and `^`/`~` ranges are checked;
 * anything else (tags, `workspace:`, `>=`, ...) is assumed to be fine.
 */
function canSatisfy(current: string, required: string): boolean {
  const major = (range: string) =>
    /^[\^~=]?v?(\d+)(?:\.[\dx*]+){0,2}(?:-[\w.]+)?$/.exec(range.trim())?.[1];
  const currentMajor = major(current);
  return (
    currentMajor === undefined ||
    required.split('||').some((range) => major(range) === currentMajor)
  );
}

/**
 * Adds the Rspack builder's packages that `package.json` does not list yet to
 * its `devDependencies`. Packages listed at a major the CLI does not support
 * are left alone and returned as incompatible.
 */
export function addMissingRspackDependencies(
  tree: Tree,
): RspackDependenciesResult {
  const result: RspackDependenciesResult = { added: [], incompatible: [] };
  if (!tree.exists('package.json')) {
    return result;
  }
  for (const [name, version] of Object.entries(RSPACK_DEV_DEPENDENCIES)) {
    const existing = getPackageJsonDependency(tree, name);
    const required = RSPACK_PEER_RANGES[name] ?? version;
    if (!existing) {
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Dev,
        name,
        version,
      });
      result.added.push(name);
    } else if (!canSatisfy(existing.version, required)) {
      result.incompatible.push({ name, current: existing.version, required });
    }
  }
  return result;
}

/** `a`, `a and b`, `a, b and c`. */
export function joinNames(names: string[]): string {
  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
    : names.join('');
}

/**
 * Adds the Rspack builder's packages to `devDependencies` when the workspace
 * builds with Rspack, and installs them with the project's package manager.
 * JavaScript projects run through Babel, not the CLI's builder, so they are
 * left alone.
 */
export function addRspackDependencies(
  options: { language?: string } = {},
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (
      isJavaScriptProject(tree, options.language) ||
      !usesRspackBuilder(tree)
    ) {
      return tree;
    }
    const { added, incompatible } = addMissingRspackDependencies(tree);
    for (const { name, current, required } of incompatible) {
      context.logger.warn(
        `${name}@"${current}" does not match the rspack builder's required range "${required}"; left unchanged. Update it before running "nest build".`,
      );
    }
    if (added.length > 0) {
      const packageManager = detectPackageManager(tree);
      context.logger.info(
        `Added ${joinNames(added)} for the rspack builder; running "${packageManager} install"`,
      );
      context.addTask(new NodePackageInstallTask({ packageManager }));
    }
    return tree;
  };
}
