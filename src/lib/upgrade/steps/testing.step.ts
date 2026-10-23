import { Rule, Tree } from '@angular-devkit/schematics';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
} from '../../../utils/dependencies.utils.js';
import { JSONFile } from '../../../utils/json-file.util.js';
import {
  parseMajor,
  parseMajorMinor,
  readPackageJson,
  UpgradeReport,
} from '../upgrade.utils.js';

// First Jest release whose runtime can `require()` ESM (jest-runtime 30.4.0).
const JEST_V30 = '^30.4.0';
const TYPES_JEST_V30 = '^30.0.0';
const TS_JEST_FOR_JEST_30 = '^29.4.0';
const VM_MODULES_FLAG = '--experimental-vm-modules';
const JEST_BIN = './node_modules/jest/bin/jest.js';
const COMMAND_SEPARATOR = /(\s*(?:&&|\|\||;)\s*)/;
const STARTS_WITH_JEST = /^jest(?=\s|$)/;
const NODE_WITH_JEST_BIN =
  /^node\s(?:.*\s)?(?:\.\/)?node_modules\/(?:\.bin\/jest|jest\/bin\/jest\.js)(?=\s|$)/;
const RUNS_JEST = /(?:^|[\s/])jest(?:\.js)?(?=\s|$)/;
const JEST_INVOCATION = /(^|\s)(?:npx\s+)?(?:\S*\/)?jest(?=\s|$)/;

/**
 * Nest 12 packages are ESM-only. Jest's module loader can only `require()`
 * ESM on Node.js 24.9+ with `--experimental-vm-modules`, so CommonJS projects
 * that stay on Jest need Jest 30.4+ (which implements `require(esm)`), a recent
 * Node.js and the flag in their test scripts. Vitest projects need nothing.
 */
export function migrateTestRunner(report: UpgradeReport): Rule {
  return (tree: Tree) => {
    const jest = getPackageJsonDependency(tree, 'jest');
    if (!jest) {
      return tree;
    }

    const jestVersion = parseMajorMinor(jest.version);
    if (
      jestVersion &&
      (jestVersion[0] < 30 || (jestVersion[0] === 30 && jestVersion[1] < 4))
    ) {
      addPackageJsonDependency(tree, {
        ...jest,
        version: JEST_V30,
        overwrite: true,
      });
      report.change(`Updated "jest" from "${jest.version}" to "${JEST_V30}"`);
    }

    const typesJest = getPackageJsonDependency(tree, '@types/jest');
    const typesJestMajor = parseMajor(typesJest?.version);
    if (typesJest && typesJestMajor !== null && typesJestMajor < 30) {
      addPackageJsonDependency(tree, {
        ...typesJest,
        version: TYPES_JEST_V30,
        overwrite: true,
      });
      report.change(
        `Updated "@types/jest" from "${typesJest.version}" to "${TYPES_JEST_V30}"`,
      );
    }

    const tsJest = getPackageJsonDependency(tree, 'ts-jest');
    const tsJestVersion = parseMajorMinor(tsJest?.version);
    if (
      tsJest &&
      tsJestVersion &&
      (tsJestVersion[0] < 29 ||
        (tsJestVersion[0] === 29 && tsJestVersion[1] < 4))
    ) {
      addPackageJsonDependency(tree, {
        ...tsJest,
        version: TS_JEST_FOR_JEST_30,
        overwrite: true,
      });
      report.change(
        `Updated "ts-jest" from "${tsJest.version}" to "${TS_JEST_FOR_JEST_30}" (first release supporting Jest 30)`,
      );
    }

    migrateJestScripts(tree, report);

    report.warn(
      `Jest: the NestJS 12 packages are ESM-only and Jest can only require() ESM modules on Node.js v24.9+ with the "${VM_MODULES_FLAG}" flag ` +
        '(otherwise test suites fail with "Must use import to load ES Module"). Run your test suite on Node.js 24.9+ ' +
        `and pass the flag wherever Jest is not started from an updated package.json script (e.g. NODE_OPTIONS=${VM_MODULES_FLAG} for IDE runners), ` +
        'or consider migrating to Vitest, the default test runner for new NestJS 12 projects.',
    );
    return tree;
  };
}

/**
 * Starts Jest the way new v12 projects do: through Node.js with
 * `--experimental-vm-modules`, which exposes the `vm.SourceTextModule` API
 * Jest needs to `require()` ESM. Every command of a compound script
 * (`&&`, `||`, `;`) is handled on its own; commands that already pass the
 * flag are kept. Jest started some other way (`cross-env`, `npx`, an env-var
 * prefix...) or without a local `node_modules/jest` (Yarn PnP, a hoisted
 * workspace) is reported instead of rewritten.
 */
function migrateJestScripts(tree: Tree, report: UpgradeReport): void {
  const scripts: Record<string, unknown> = readPackageJson(tree)?.scripts ?? {};
  const json = new JSONFile(tree, '/package.json');
  const localJest = hasLocalJestBin(tree);

  for (const [name, script] of Object.entries(scripts)) {
    if (typeof script !== 'string') {
      continue;
    }
    const parts = script.split(COMMAND_SEPARATOR);
    const missing: number[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const command = parts[i];
      if (command.includes(VM_MODULES_FLAG) || !RUNS_JEST.test(command)) {
        continue;
      }
      if (localJest && STARTS_WITH_JEST.test(command)) {
        parts[i] = command.replace(
          STARTS_WITH_JEST,
          `node ${VM_MODULES_FLAG} ${JEST_BIN}`,
        );
      } else if (localJest && NODE_WITH_JEST_BIN.test(command)) {
        parts[i] = command.replace(/^node(?=\s)/, `node ${VM_MODULES_FLAG}`);
      } else {
        missing.push(i);
      }
    }

    const updated = parts.join('');
    if (updated !== script) {
      json.modify(['scripts', name], updated);
      report.change(
        `package.json: updated the "${name}" script to run Jest with ${VM_MODULES_FLAG} ("${updated}")`,
      );
    }
    if (missing.length === 0) {
      continue;
    }
    if (!localJest) {
      report.action(
        `package.json: the "${name}" script runs Jest without ${VM_MODULES_FLAG}, and "${JEST_BIN}" does not exist (Yarn PnP or a hoisted workspace?). ` +
          `Append the flag to NODE_OPTIONS, keeping what your package manager sets there, e.g. "cross-env NODE_OPTIONS=\\"$NODE_OPTIONS ${VM_MODULES_FLAG}\\" jest".`,
      );
      continue;
    }
    for (const i of missing) {
      parts[i] = withVmModulesFlag(parts[i]);
    }
    report.action(
      `package.json: the "${name}" script runs Jest without ${VM_MODULES_FLAG} ("${updated}"). ` +
        `Start Jest through Node.js with the flag, e.g. "${parts.join('')}".`,
    );
  }
}

/** Suggests the flagged form of a command that starts Jest indirectly. */
function withVmModulesFlag(command: string): string {
  return /(^|\s)node\s/.test(command)
    ? command.replace(/(^|\s)node(?=\s)/, `$1node ${VM_MODULES_FLAG}`)
    : command.replace(JEST_INVOCATION, `$1node ${VM_MODULES_FLAG} ${JEST_BIN}`);
}

/**
 * `node_modules/jest/bin/jest.js` is what the v12 scripts start. Yarn PnP has
 * no `node_modules`, and workspaces may hoist Jest to the root one, where the
 * relative path does not resolve. Without any `node_modules` yet (fresh
 * clone), assume a regular install.
 */
function hasLocalJestBin(tree: Tree): boolean {
  if (tree.exists('.pnp.cjs') || tree.exists('.pnp.js')) {
    return false;
  }
  if (tree.exists('node_modules/jest/bin/jest.js')) {
    return true;
  }
  const nodeModules = tree.getDir('node_modules');
  return nodeModules.subdirs.length === 0 && nodeModules.subfiles.length === 0;
}
