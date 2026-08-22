import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks/index.js';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
  NodeDependencyType,
} from '../../../utils/dependencies.utils.js';
import type { UpgradeOptions } from '../upgrade.schema.js';
import { JSONFile } from '../../../utils/json-file.util.js';
import {
  parseMajor,
  parseMajorMinor,
  readPackageJson,
  UpgradeReport,
} from '../upgrade.utils.js';

const NEST_V12 = '^12.0.0';
const GRAPHQL_V14 = '^14.0.0';

/**
 * NestJS packages whose v12-compatible major is known. Any other `@nestjs/*`
 * package found in the project is reported so the user can review it.
 */
export const NEST_V12_PACKAGES: Record<string, string> = {
  '@nestjs/common': NEST_V12,
  '@nestjs/core': NEST_V12,
  '@nestjs/testing': NEST_V12,
  '@nestjs/platform-express': NEST_V12,
  '@nestjs/platform-fastify': NEST_V12,
  '@nestjs/platform-ws': NEST_V12,
  '@nestjs/platform-socket.io': NEST_V12,
  '@nestjs/websockets': NEST_V12,
  '@nestjs/microservices': NEST_V12,
  '@nestjs/cli': NEST_V12,
  '@nestjs/schematics': NEST_V12,
  '@nestjs/swagger': NEST_V12,
  '@nestjs/config': NEST_V12,
  '@nestjs/graphql': GRAPHQL_V14,
  '@nestjs/apollo': GRAPHQL_V14,
  '@nestjs/mercurius': GRAPHQL_V14,
};

/** Packages that are not tied to a NestJS major. */
const VERSION_AGNOSTIC_PACKAGES = ['@nestjs/mau', '@nestjs/observe'];

const TYPESCRIPT_V6 = '^6.0.0';
const MIN_NODE_ENGINE = '>=20.19.0';

const ALL_DEPENDENCY_TYPES = [
  NodeDependencyType.Default,
  NodeDependencyType.Dev,
  NodeDependencyType.Peer,
  NodeDependencyType.Optional,
];

export function updateNestDependencies(
  options: UpgradeOptions,
  report: UpgradeReport,
): Rule {
  return (tree: Tree) => {
    const updated: string[] = [];
    for (const [name, version] of Object.entries(NEST_V12_PACKAGES)) {
      const dependency = getPackageJsonDependency(tree, name);
      if (!dependency) {
        continue;
      }
      const target = options.tag ? options.tag : version;
      if (dependency.version !== target) {
        addPackageJsonDependency(tree, {
          ...dependency,
          version: target,
          overwrite: true,
        });
      }
      updated.push(`${name}@${target}`);
    }
    if (updated.length > 0) {
      report.change(`Updated NestJS packages: ${updated.join(', ')}`);
    }

    const unknown = findUnknownNestPackages(tree);
    if (unknown.length > 0) {
      report.warn(
        `The following @nestjs packages were left untouched because their v12-compatible release is not known to this schematic: ${unknown.join(', ')}. ` +
          `Review them with "npx npm-check-updates '/^@nestjs\\//i' -u" and update them to releases that support NestJS 12.`,
      );
    }

    const typescript = getPackageJsonDependency(tree, 'typescript');
    const typescriptMajor = parseMajor(typescript?.version);
    if (typescript && typescriptMajor !== null && typescriptMajor < 6) {
      addPackageJsonDependency(tree, {
        ...typescript,
        version: TYPESCRIPT_V6,
        overwrite: true,
      });
      report.change(
        `Updated "typescript" from "${typescript.version}" to "${TYPESCRIPT_V6}" (required by @nestjs/cli and @nestjs/schematics v12)`,
      );
      report.warn(
        'TypeScript 6 deprecates several legacy "tsconfig.json" options (e.g. "baseUrl", "esModuleInterop" defaults changed). Run "npx tsc --noEmit" after installing and adjust your configuration if needed.',
      );
    }
    updateNodeEngine(tree, report);
    return tree;
  };
}

/**
 * Raises `engines.node` to the v12 minimum when the field exists and points
 * at an older release, so CI images and deploy targets fail fast.
 */
function updateNodeEngine(tree: Tree, report: UpgradeReport): void {
  const engines = readPackageJson(tree)?.engines;
  const current = engines?.node;
  if (typeof current !== 'string') {
    return;
  }
  const lowest = current
    .split('||')
    .map((range) => parseMajorMinor(range) ?? [parseMajor(range) ?? NaN, 0])
    .filter(([major]) => !Number.isNaN(major))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])[0];
  if (!lowest) {
    return;
  }
  const [major, minor] = lowest;
  const belowMinimum = major < 20 || (major === 20 && minor < 19);
  if (!belowMinimum) {
    return;
  }
  new JSONFile(tree, '/package.json').modify(
    ['engines', 'node'],
    MIN_NODE_ENGINE,
  );
  report.change(
    `Updated "engines.node" from "${current}" to "${MIN_NODE_ENGINE}" (NestJS 12 minimum)`,
  );
}

function findUnknownNestPackages(tree: Tree): string[] {
  const packageJson = readPackageJson(tree) ?? {};
  const unknown = new Set<string>();
  for (const type of ALL_DEPENDENCY_TYPES) {
    for (const name of Object.keys(packageJson[type] ?? {})) {
      if (
        name.startsWith('@nestjs/') &&
        !(name in NEST_V12_PACKAGES) &&
        !VERSION_AGNOSTIC_PACKAGES.includes(name)
      ) {
        unknown.add(name);
      }
    }
  }
  return [...unknown].sort();
}

export function detectPackageManager(tree: Tree): string {
  if (tree.exists('bun.lock') || tree.exists('bun.lockb')) {
    return 'bun';
  }
  if (tree.exists('pnpm-lock.yaml')) {
    return 'pnpm';
  }
  if (tree.exists('yarn.lock')) {
    return 'yarn';
  }
  return 'npm';
}

export function installDependencies(
  options: UpgradeOptions,
  report: UpgradeReport,
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.skipInstall) {
      report.action(
        "Dependencies were not installed (--skip-install). Run your package manager's install command to finish the upgrade.",
      );
      return tree;
    }
    const packageManager = detectPackageManager(tree);
    context.addTask(new NodePackageInstallTask({ packageManager }));
    report.change(`Scheduled "${packageManager} install"`);
    return tree;
  };
}
