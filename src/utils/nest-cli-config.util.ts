import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { parse } from 'jsonc-parser';

/**
 * The config file names the CLI looks for, in the order it tries them.
 */
export const NEST_CLI_CONFIG_FILES = ['nest-cli.json', '.nest-cli.json'];

/**
 * Resolves the Nest CLI config file in use. The CLI loads the first file that
 * exists and ignores the remaining candidates, so a config without a `builder`
 * is not overridden by a later file.
 */
export function findNestCliConfigPath(tree: Tree): string | undefined {
  return NEST_CLI_CONFIG_FILES.find((candidate) => tree.exists(candidate));
}

/**
 * The config file names the CLI no longer loads.
 */
export const LEGACY_NEST_CLI_CONFIG_FILES = ['.nestcli.json', 'nest.json'];

/**
 * Tells the user why a new `nest-cli.json` appeared next to a legacy config
 * file. Call it only when no supported config file exists.
 */
export function warnAboutLegacyNestCliConfig(
  tree: Tree,
  context: SchematicContext,
): void {
  const legacyFile = LEGACY_NEST_CLI_CONFIG_FILES.find((candidate) =>
    tree.exists(candidate),
  );
  if (legacyFile) {
    context.logger.warn(
      `The Nest CLI ignores "${legacyFile}", so a new "nest-cli.json" was created. Move the configuration from "${legacyFile}" into "nest-cli.json".`,
    );
  }
}

export function readJsonFile<T = Record<string, any>>(
  tree: Tree,
  path: string,
): T | null {
  const buffer = tree.read(path);
  if (!buffer) {
    return null;
  }
  try {
    return parse(buffer.toString('utf-8')) as T;
  } catch {
    return null;
  }
}
