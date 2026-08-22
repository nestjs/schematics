import { Rule, Tree } from '@angular-devkit/schematics';
import { readJsonFile, UpgradeReport } from '../upgrade.utils.js';

const NODENEXT_SNIPPET = `{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "target": "ES2023"
  }
}`;

/**
 * Projects generated with Nest v10 or earlier still use
 * `"module": "commonjs"` without a `moduleResolution`. That combination
 * cannot resolve the `exports` maps of the ESM-only v12 packages; the guide
 * asks for `nodenext` (the v11 CLI default).
 */
export function checkTsConfig(report: UpgradeReport): Rule {
  return (tree: Tree) => {
    const tsconfig = readJsonFile(tree, 'tsconfig.json');
    const compilerOptions = tsconfig?.compilerOptions;
    if (!compilerOptions || typeof compilerOptions !== 'object') {
      return tree;
    }
    const module = String(compilerOptions.module ?? '').toLowerCase();
    const moduleResolution = String(
      compilerOptions.moduleResolution ?? '',
    ).toLowerCase();
    const legacyResolution =
      moduleResolution === '' ||
      moduleResolution === 'node' ||
      moduleResolution === 'node10' ||
      moduleResolution === 'classic';

    if (module === 'commonjs' && legacyResolution) {
      report.action(
        'tsconfig.json uses "module": "commonjs" with a legacy module resolution, which cannot resolve the ESM-only NestJS 12 packages. ' +
          `Update "compilerOptions" as follows (this is what the v11 CLI generates; your emitted code stays CommonJS as long as package.json has no "type": "module"):\n${NODENEXT_SNIPPET}`,
      );
    } else if (legacyResolution && moduleResolution !== '') {
      report.action(
        `tsconfig.json uses "moduleResolution": "${compilerOptions.moduleResolution}", which TypeScript 6 no longer supports and which cannot resolve the ESM-only NestJS 12 packages. Switch to "nodenext" (or "bundler").`,
      );
    }
    return tree;
  };
}
