import { existsSync, readFileSync, readdirSync } from 'fs';
import * as path from 'path';

const libRoot = path.join(process.cwd(), 'src', 'lib');

/**
 * Pairs every `schema.json` with the hand-written declaration file the CLI
 * consumes, so documented defaults cannot drift away from the real ones.
 */
const schemaPairs = readdirSync(libRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const dir = path.join(libRoot, entry.name);
    const schemaPath = path.join(dir, 'schema.json');
    const declarations = readdirSync(dir).filter((file) =>
      file.endsWith('.schema.d.ts'),
    );
    return {
      name: entry.name,
      schemaPath,
      declarationPath: declarations.length
        ? path.join(dir, declarations[0])
        : undefined,
    };
  })
  .filter((pair) => existsSync(pair.schemaPath) && pair.declarationPath);

/**
 * Reads the `@default` JSDoc tags out of a declaration file, keyed by the
 * property they document.
 */
function documentedDefaults(declarationPath: string): Record<string, string> {
  const source = readFileSync(declarationPath, 'utf-8');
  const defaults: Record<string, string> = {};
  const blocks = source.matchAll(
    /@default\s+(.+?)\s*\n(?:\s*\*.*\n)*?\s*\*\/\s*\n?\s*(\w+)\??\s*[:?]/g,
  );
  for (const block of blocks) {
    defaults[block[2]] = block[1].trim().replace(/^["']|["']$/g, '');
  }
  return defaults;
}

describe('Schema defaults', () => {
  it('should find schema/declaration pairs to check', () => {
    expect(schemaPairs.length).toBeGreaterThan(0);
  });

  it.each(schemaPairs)(
    '`$name` should document the same defaults its schema.json declares',
    ({ schemaPath, declarationPath }) => {
      const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      const documented = documentedDefaults(declarationPath!);

      for (const [property, value] of Object.entries(documented)) {
        const actual = schema.properties?.[property]?.default;
        if (actual === undefined) {
          continue;
        }
        expect(`${property}=${String(actual)}`).toEqual(`${property}=${value}`);
      }
    },
  );

  it('should default the application module type to esm', () => {
    const schema = JSON.parse(
      readFileSync(path.join(libRoot, 'application', 'schema.json'), 'utf-8'),
    );

    expect(schema.properties.type.default).toBe('esm');
    expect(schema.properties.type.enum.sort()).toEqual(['cjs', 'esm']);
  });

  it.each(schemaPairs)(
    '`$name` should default specFileSuffix to spec when it exposes the option',
    ({ schemaPath }) => {
      const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      const specFileSuffix = schema.properties?.specFileSuffix;
      if (!specFileSuffix) {
        return;
      }

      expect(specFileSuffix.default).toBe('spec');
    },
  );
});
