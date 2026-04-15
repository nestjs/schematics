import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

const FORMATTABLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

/**
 * Returns a Rule that formats newly generated or modified files using
 * Prettier when available. Falls back to a no-op if Prettier is not
 * installed in the consuming project.
 *
 * The formatter honors the project's resolved Prettier configuration
 * (e.g. .prettierrc) when one is present.
 *
 * @param paths Optional list of file paths to format. If omitted, all
 * files in the tree with a formattable extension are processed.
 */
export function formatFiles(paths?: Array<string | Path>): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    let prettier: typeof import('prettier');
    try {
      prettier = await import('prettier');
    } catch {
      // Prettier not installed — skip formatting silently.
      return tree;
    }

    const candidates = (
      paths ??
      tree.actions
        .filter(
          (action) =>
            action.kind === 'c' ||
            action.kind === 'o' ||
            action.kind === 'r',
        )
        .map((action) => (action as { path: string }).path)
    )
      .map((p) => (typeof p === 'string' ? p : String(p)))
      .filter((p) => FORMATTABLE_EXTENSIONS.some((ext) => p.endsWith(ext)));

    const uniquePaths = Array.from(new Set(candidates));

    for (const filePath of uniquePaths) {
      if (!tree.exists(filePath)) {
        continue;
      }
      const buffer = tree.read(filePath);
      if (!buffer) {
        continue;
      }
      const source = buffer.toString('utf-8');
      try {
        const resolvedOptions =
          (await prettier.resolveConfig(filePath)) ?? undefined;
        const formatted = await prettier.format(source, {
          ...resolvedOptions,
          filepath: filePath,
        });
        if (formatted !== source) {
          tree.overwrite(filePath, formatted);
        }
      } catch {
        // Formatting failures must not break schematic execution.
        continue;
      }
    }

    return tree;
  };
}
