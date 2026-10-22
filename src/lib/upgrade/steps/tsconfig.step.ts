import { Rule, Tree } from '@angular-devkit/schematics';
import { getPackageJsonDependency } from '../../../utils/dependencies.utils.js';
import { readJsonFile, UpgradeReport } from '../upgrade.utils.js';

const NODENEXT_SNIPPET = `{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "target": "ES2023"
  }
}`;

/** Globals that TypeScript 6 only declares when "types" lists their package. */
const GLOBAL_TYPES: Record<string, string> = {
  node: '"process" (error TS2591)',
  jest: '"describe" (error TS2593)',
};

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

    const buildConfig = readJsonFile(tree, 'tsconfig.build.json');
    if (buildConfig) {
      const buildCompilerOptions = buildConfig.compilerOptions;
      const hasRootDir =
        (buildCompilerOptions &&
          typeof buildCompilerOptions === 'object' &&
          'rootDir' in buildCompilerOptions) ||
        (compilerOptions && 'rootDir' in compilerOptions);
      if (!hasRootDir) {
        report.action(
          'tsconfig.build.json does not set "rootDir". TypeScript 6 requires it explicitly (error TS5011); add `"rootDir": "./src"` to its "compilerOptions" to keep the dist layout unchanged.',
        );
      }
    }

    if (
      !('rootDir' in compilerOptions) &&
      getPackageJsonDependency(tree, 'ts-jest')
    ) {
      const build = buildConfig
        ? ' (tsconfig.build.json keeps "./src" for the build)'
        : '';
      report.action(
        `tsconfig.json does not set "rootDir". ts-jest compiles the specs with it, and TypeScript 6 fails every suite with error TS5011; add \`"rootDir": "."\` to its "compilerOptions"${build}.`,
      );
    }

    if (
      'baseUrl' in compilerOptions &&
      compilerOptions.ignoreDeprecations !== '6.0'
    ) {
      const baseUrl = String(compilerOptions.baseUrl);
      const fix = ['.', './'].includes(baseUrl)
        ? 'Remove it, prefix any "paths" targets with "./" and map imports that rely on it (such as "src/app.service") with a `"src/*": ["./src/*"]` entry in "paths".'
        : 'Rewrite "paths" targets relative to tsconfig.json (with a leading "./") and remove it.';
      report.action(
        `tsconfig.json sets "baseUrl": "${baseUrl}", which TypeScript 6 rejects (error TS5101). ${fix} Or add \`"ignoreDeprecations": "6.0"\` to keep it until TypeScript 7.`,
      );
    }

    const types = Object.keys(GLOBAL_TYPES).filter((name) =>
      getPackageJsonDependency(tree, `@types/${name}`),
    );
    if (types.length > 0 && !('types' in compilerOptions)) {
      report.action(
        `tsconfig.json does not set "types", which TypeScript 6 defaults to [], so globals such as ${types.map((name) => GLOBAL_TYPES[name]).join(' and ')} are not found. Add \`"types": [${types.map((name) => `"${name}"`).join(', ')}]\` to its "compilerOptions".`,
      );
    }
    return tree;
  };
}
