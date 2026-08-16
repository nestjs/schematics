import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';

/** Schematics that emit a spec file next to the element they generate. */
const elementSchematics = [
  'controller',
  'service',
  'provider',
  'resolver',
  'gateway',
  'class',
  'filter',
  'guard',
  'pipe',
  'interceptor',
  'middleware',
  'resource',
];

/** Schematics that scaffold a whole tree containing spec files. */
const treeSchematics: Array<[string, Record<string, unknown>]> = [
  ['application', { name: '' }],
  ['library', { name: 'shared', prefix: '@app' }],
  ['sub-app', { name: 'admin' }],
];

describe('Spec file generation', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  const specFiles = (tree: UnitTestTree, suffix: string) =>
    tree.files.filter((file) =>
      new RegExp(`\\.${suffix}\\.(ts|js)$`).test(file),
    );

  const anySpecLike = (tree: UnitTestTree) =>
    tree.files.filter((file) => /\.(spec|test)\.(ts|js)$/.test(file));

  describe.each(elementSchematics)('`%s`', (schematic) => {
    it('should generate a .spec file by default', async () => {
      const tree = await runner.runSchematic(schematic, { name: 'foo' });

      expect(specFiles(tree, 'spec').length).toBeGreaterThan(0);
    });

    it('should honour a custom spec file suffix', async () => {
      const tree = await runner.runSchematic(schematic, {
        name: 'foo',
        specFileSuffix: 'test',
      });

      expect(specFiles(tree, 'test').length).toBeGreaterThan(0);
      expect(specFiles(tree, 'spec')).toEqual([]);
    });

    it('should generate no spec file when spec is disabled', async () => {
      const tree = await runner.runSchematic(schematic, {
        name: 'foo',
        spec: false,
      });

      expect(anySpecLike(tree)).toEqual([]);
    });

    it('should normalize a camelCased spec file suffix', async () => {
      const tree = await runner.runSchematic(schematic, {
        name: 'foo',
        specFileSuffix: 'integrationTest',
      });

      expect(specFiles(tree, 'integration-test').length).toBeGreaterThan(0);
    });
  });

  describe.each(treeSchematics)('`%s`', (schematic, options) => {
    it('should generate .spec files by default', async () => {
      const tree = await runner.runSchematic(schematic, options);

      expect(specFiles(tree, 'spec').length).toBeGreaterThan(0);
    });

    it('should honour a custom spec file suffix', async () => {
      const tree = await runner.runSchematic(schematic, {
        ...options,
        specFileSuffix: 'test',
      });

      expect(specFiles(tree, 'test').length).toBeGreaterThan(0);
      expect(specFiles(tree, 'spec')).toEqual([]);
    });
  });

  // `library` and `sub-app` do not expose a `spec` option (they never have),
  // so only `application` can suppress spec files.
  it('`application` should generate no spec files when spec is disabled', async () => {
    const tree = await runner.runSchematic('application', {
      name: '',
      spec: false,
    });

    expect(anySpecLike(tree)).toEqual([]);
  });
});
