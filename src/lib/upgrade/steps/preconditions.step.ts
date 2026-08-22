import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { getPackageJsonDependency } from '../../../utils/dependencies.utils.js';
import {
  MIGRATION_GUIDE_URL,
  parseMajor,
  parseVersion,
  UpgradeReport,
} from '../upgrade.utils.js';

/**
 * Nest 12 ships ESM-only packages. CommonJS applications keep working thanks
 * to `require(esm)`, which is available (unflagged) on Node.js 20.19+ and
 * 22.12+. Older releases (and the short-lived 21.x line) are not supported.
 */
export function isSupportedNodeVersion(version: string): boolean {
  const [major, minor] = parseVersion(version);
  if (major === undefined) {
    return true;
  }
  if (major === 20) {
    return minor >= 19;
  }
  if (major === 22) {
    return minor >= 12;
  }
  return major > 22;
}

export function checkNodeVersion(
  report: UpgradeReport,
  version: string = process.versions.node,
): void {
  if (!isSupportedNodeVersion(version)) {
    throw new SchematicsException(
      `NestJS 12 requires Node.js v20.19+ or v22.12+ (the ESM packages rely on "require(esm)"), ` +
        `but you are running v${version}. Please upgrade Node.js (the latest active LTS is recommended) and re-run the upgrade.`,
    );
  }
  const [major] = parseVersion(version);
  if (major < 22) {
    report.warn(
      `You are running Node.js v${version}. NestJS 12 works on v20.19+, but the latest active LTS (v22.12+) is strongly recommended.`,
    );
  }
}

/**
 * Makes sure we are in a NestJS project that is on v11. Projects on v10 (or
 * older) have to go through the v11 migration first.
 */
export function assertUpgradeable(tree: Tree, report: UpgradeReport): void {
  if (!tree.exists('package.json')) {
    throw new SchematicsException(
      'Could not find "package.json". Run the upgrade from the root of your NestJS project.',
    );
  }
  const core =
    getPackageJsonDependency(tree, '@nestjs/core') ??
    getPackageJsonDependency(tree, '@nestjs/common');
  if (!core) {
    throw new SchematicsException(
      'Could not find "@nestjs/core" (or "@nestjs/common") in "package.json". ' +
        'Is this a NestJS project? Run the upgrade from the project root.',
    );
  }
  const major = parseMajor(core.version);
  if (major === null) {
    report.warn(
      `Could not determine the installed NestJS version from "${core.name}": "${core.version}". Assuming v11.`,
    );
    return;
  }
  if (major < 11) {
    throw new SchematicsException(
      `Detected NestJS v${major} ("${core.name}": "${core.version}"). ` +
        'This schematic upgrades from v11 to v12 only. Please upgrade to v11 first ' +
        `(see https://github.com/nestjs/nest/releases/tag/v11.0.0 and ${MIGRATION_GUIDE_URL}), then re-run the upgrade.`,
    );
  }
  if (major >= 12) {
    report.note(
      `"${core.name}" is already on v${major}; re-applying the v12 migrations (they are idempotent).`,
    );
  }
}
