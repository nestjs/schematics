import { Rule, Tree } from '@angular-devkit/schematics';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
} from '../../../utils/dependencies.utils.js';
import {
  parseMajor,
  parseMajorMinor,
  UpgradeReport,
} from '../upgrade.utils.js';

const JEST_V30 = '^30.0.0';
const TYPES_JEST_V30 = '^30.0.0';
const TS_JEST_FOR_JEST_30 = '^29.4.0';

/**
 * Nest 12 packages are ESM-only. Jest's module loader can only `require()`
 * ESM on Node.js 24.9+, so CommonJS projects that stay on Jest need Jest 30
 * (which implements `require(esm)`) and a recent Node.js. Vitest projects
 * need nothing.
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

    report.warn(
      'Jest: the NestJS 12 packages are ESM-only and Jest can only require() ESM modules on Node.js v24.9+ ' +
        '(older versions fail with ERR_REQUIRE_ASYNC_MODULE). Run your test suite on Node.js 24.9+, ' +
        'or consider migrating to Vitest, the default test runner for new NestJS 12 projects.',
    );
    return tree;
  };
}
