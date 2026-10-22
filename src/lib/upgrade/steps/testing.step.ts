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

const JEST_V30 = '^30.0.0';
const TYPES_JEST_V30 = '^30.0.0';
const TS_JEST_FOR_JEST_30 = '^29.4.0';
const VM_MODULES_FLAG = '--experimental-vm-modules';
const JEST_BIN = './node_modules/jest/bin/jest.js';

/**
 * Nest 12 packages are ESM-only. Jest's module loader can only `require()`
 * ESM on Node.js 24.9+ with `--experimental-vm-modules`, so CommonJS projects
 * that stay on Jest need Jest 30 (which implements `require(esm)`), a recent
 * Node.js and the flag in their test scripts. Vitest projects need nothing.
 */
export function migrateTestRunner(report: UpgradeReport): Rule {
  return (tree: Tree) => {
    const jest = getPackageJsonDependency(tree, 'jest');
    if (!jest) {
      return tree;
    }

    const jestMajor = parseMajor(jest.version);
    if (jestMajor !== null && jestMajor < 30) {
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
 * Jest needs to `require()` ESM. Scripts that already pass the flag, or start
 * Jest some other way (`cross-env`, `npx`...), are left as they are.
 */
function migrateJestScripts(tree: Tree, report: UpgradeReport): void {
  const scripts: Record<string, unknown> = readPackageJson(tree)?.scripts ?? {};
  const json = new JSONFile(tree, '/package.json');

  for (const [name, script] of Object.entries(scripts)) {
    if (typeof script !== 'string' || script.includes(VM_MODULES_FLAG)) {
      continue;
    }
    let updated = script.replace(
      /^jest(?=\s|$)/,
      `node ${VM_MODULES_FLAG} ${JEST_BIN}`,
    );
    if (updated === script && /^node\s.*\bjest(?:\.js)?(?=\s|$)/.test(script)) {
      updated = script.replace(/^node(?=\s)/, `node ${VM_MODULES_FLAG}`);
    }
    if (updated !== script) {
      json.modify(['scripts', name], updated);
      report.change(
        `package.json: updated the "${name}" script to run Jest with ${VM_MODULES_FLAG} ("${updated}")`,
      );
    }
  }
}
