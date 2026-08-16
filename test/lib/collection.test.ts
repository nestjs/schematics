import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

interface CollectionEntry {
  factory: string;
  description?: string;
  schema?: string;
  aliases?: string[];
  hidden?: boolean;
}

const srcRoot = path.join(process.cwd(), 'src');
const collection: { schematics: Record<string, CollectionEntry> } = JSON.parse(
  readFileSync(path.join(srcRoot, 'collection.json'), 'utf-8'),
);
const entries = Object.entries(collection.schematics);

describe('collection.json', () => {
  it('should declare at least one schematic', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)(
    '`%s` should point at an existing factory file',
    (_, entry) => {
      const [modulePath] = entry.factory.split('#');
      const resolved = path.join(srcRoot, `${modulePath}.ts`);

      expect(existsSync(resolved)).toBe(true);
    },
  );

  it.each(entries)(
    '`%s` should export the named factory symbol',
    (_, entry) => {
      const [modulePath, exportName = 'default'] = entry.factory.split('#');
      const source = readFileSync(
        path.join(srcRoot, `${modulePath}.ts`),
        'utf-8',
      );

      expect(source).toMatch(
        new RegExp(`export\\s+(function|const)\\s+${exportName}\\b`),
      );
    },
  );

  it.each(entries.filter(([, entry]) => entry.schema))(
    '`%s` should point at an existing schema file',
    (_, entry) => {
      expect(existsSync(path.join(srcRoot, entry.schema!))).toBe(true);
    },
  );

  it.each(entries.filter(([, entry]) => entry.schema))(
    '`%s` should have a parseable schema',
    (_, entry) => {
      const schema = JSON.parse(
        readFileSync(path.join(srcRoot, entry.schema!), 'utf-8'),
      );

      expect(schema).toHaveProperty('properties');
    },
  );

  it.each(entries)('`%s` should carry a description', (_, entry) => {
    expect(entry.description).toBeTruthy();
  });

  it('should not declare duplicate aliases', () => {
    const aliases = entries.flatMap(([, entry]) => entry.aliases ?? []);

    expect(aliases.length).toEqual(new Set(aliases).size);
  });

  it('should not declare an alias that collides with a schematic name', () => {
    const names = new Set(entries.map(([name]) => name));
    const aliases = entries.flatMap(([, entry]) => entry.aliases ?? []);

    expect(aliases.filter((alias) => names.has(alias))).toEqual([]);
  });

  it('should no longer expose the removed angular schematic', () => {
    expect(Object.keys(collection.schematics)).not.toContain('angular');
    expect(existsSync(path.join(srcRoot, 'lib/client-app'))).toBe(false);
  });
});
