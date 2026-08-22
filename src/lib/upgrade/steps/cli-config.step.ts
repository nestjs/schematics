import { Rule, Tree } from '@angular-devkit/schematics';
import { JSONFile } from '../../../utils/json-file.util.js';
import {
  findNestCliConfigPath,
  readJsonFile,
  readPackageJson,
  UpgradeReport,
} from '../upgrade.utils.js';

const RSPACK_MIGRATION_URL = 'https://rspack.dev/guide/migration/webpack';

/**
 * The v12 CLI deprecates the webpack-centric options in favour of Rspack:
 *  - `compilerOptions.webpack` / `compilerOptions.webpackConfigPath` in
 *    `nest-cli.json` → `compilerOptions.builder` (`'rspack'` or
 *    `{ type: 'rspack', options: { configPath } }`),
 *  - `--webpack` / `--webpackPath` CLI flags → `--builder rspack` /
 *    `--rspackPath`.
 */
export function migrateCliConfig(report: UpgradeReport): Rule {
  return (tree: Tree) => {
    const configPaths: string[] = [];
    const cliConfigPath = findNestCliConfigPath(tree);
    if (cliConfigPath) {
      configPaths.push(...migrateNestCliJson(tree, cliConfigPath, report));
    }
    configPaths.push(...migrateScripts(tree, report));

    if (configPaths.length > 0) {
      report.action(
        `Port the webpack configuration file(s) ${[...new Set(configPaths)]
          .map((path) => `"${path}"`)
          .join(
            ', ',
          )} to Rspack (the API is largely compatible; see ${RSPACK_MIGRATION_URL}). ` +
          'Replace "webpack" imports with "@rspack/core" and drop webpack-only plugins/loaders (e.g. "ts-loader" is not needed with Rspack\'s built-in SWC loader).',
      );
    }
    return tree;
  };
}

function migrateNestCliJson(
  tree: Tree,
  path: string,
  report: UpgradeReport,
): string[] {
  const config = readJsonFile(tree, path);
  if (!config) {
    return [];
  }
  const json = new JSONFile(tree, path);
  const configPaths: string[] = [];

  const targets: Array<{ label: string; jsonPath: string[]; options: any }> = [
    {
      label: 'compilerOptions',
      jsonPath: ['compilerOptions'],
      options: config.compilerOptions,
    },
  ];
  for (const [name, project] of Object.entries<any>(config.projects ?? {})) {
    targets.push({
      label: `projects.${name}.compilerOptions`,
      jsonPath: ['projects', name, 'compilerOptions'],
      options: project?.compilerOptions,
    });
  }

  for (const { label, jsonPath, options } of targets) {
    if (!options || typeof options !== 'object') {
      continue;
    }
    const usesWebpack = options.webpack === true;
    const webpackConfigPath: string | undefined =
      typeof options.webpackConfigPath === 'string'
        ? options.webpackConfigPath
        : undefined;
    const builder = options.builder;
    const builderType = typeof builder === 'string' ? builder : builder?.type;
    const builderConfigPath: string | undefined =
      typeof builder === 'object' ? builder?.options?.configPath : undefined;

    if (
      !usesWebpack &&
      webpackConfigPath === undefined &&
      options.webpack === undefined &&
      builderType !== 'webpack'
    ) {
      continue;
    }

    if (
      usesWebpack ||
      webpackConfigPath !== undefined ||
      builderType === 'webpack'
    ) {
      const configPath = builderConfigPath ?? webpackConfigPath;
      const newBuilder = configPath
        ? { type: 'rspack', options: { configPath } }
        : 'rspack';
      if (
        builderType === 'webpack' ||
        (usesWebpack && builderType === undefined) ||
        (webpackConfigPath !== undefined && builderType === undefined)
      ) {
        json.modify([...jsonPath, 'builder'], newBuilder);
        report.change(
          `${path}: ${label}.builder set to ${JSON.stringify(newBuilder)} (webpack is deprecated in favour of Rspack)`,
        );
        if (configPath) {
          configPaths.push(configPath);
        }
      } else if (usesWebpack || webpackConfigPath !== undefined) {
        report.note(
          `${path}: ${label} already defines "builder" (${JSON.stringify(builderType)}); removed the deprecated "webpack"/"webpackConfigPath" options.`,
        );
      }
    }
    if (options.webpack !== undefined) {
      json.remove([...jsonPath, 'webpack']);
      if (!usesWebpack) {
        report.change(
          `${path}: removed the deprecated "${label}.webpack: false" option`,
        );
      }
    }
    if (webpackConfigPath !== undefined) {
      json.remove([...jsonPath, 'webpackConfigPath']);
    }
  }
  return configPaths;
}

function migrateScripts(tree: Tree, report: UpgradeReport): string[] {
  const packageJson = readPackageJson(tree);
  const scripts: Record<string, unknown> = packageJson?.scripts ?? {};
  const configPaths: string[] = [];
  const json = new JSONFile(tree, '/package.json');

  for (const [name, script] of Object.entries(scripts)) {
    if (
      typeof script !== 'string' ||
      !/--webpack|--builder[ =]webpack|-b webpack/.test(script)
    ) {
      continue;
    }
    let updated = script;
    updated = updated.replace(
      /--webpackPath(?:=|\s+)(\S+)/g,
      (_match, configPath: string) => {
        configPaths.push(configPath.replace(/^['"]|['"]$/g, ''));
        return `--rspackPath ${configPath}`;
      },
    );
    updated = updated.replace(
      /--builder[ =]webpack\b|-b webpack\b/g,
      '--builder rspack',
    );
    updated = updated.replace(/--webpack\b(?!Path)/g, '--builder rspack');
    if (updated !== script) {
      json.modify(['scripts', name], updated);
      report.change(
        `package.json: updated the "${name}" script to use Rspack ("${updated}")`,
      );
    }
  }
  return configPaths;
}
