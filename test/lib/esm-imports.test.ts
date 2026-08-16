import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { ApplicationOptions } from '../../src/lib/application/application.schema.js';

/**
 * Relative specifiers must carry an explicit `.js` extension under
 * `module: nodenext`, and must not carry one in a CJS project.
 */
const RELATIVE_SPECIFIER =
  /(?:import|export)[\s\S]*?from\s+'(\.{1,2}\/[^']*)'/g;

function relativeSpecifiers(tree: UnitTestTree): Array<[string, string]> {
  const found: Array<[string, string]> = [];
  for (const file of tree.files) {
    if (!file.endsWith('.ts')) {
      continue;
    }
    const content = tree.readContent(file);
    for (const match of content.matchAll(RELATIVE_SPECIFIER)) {
      found.push([file, match[1]]);
    }
  }
  return found;
}

describe('Generated relative imports', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  const app = async (type: 'esm' | 'cjs'): Promise<UnitTestTree> =>
    runner.runSchematic('application', {
      name: '',
      type,
    } as ApplicationOptions);

  // Every schematic that emits at least one relative import.
  const schematics: Array<[string, Record<string, unknown>]> = [
    ['controller', { name: 'foo' }],
    ['service', { name: 'foo' }],
    ['provider', { name: 'foo' }],
    ['resolver', { name: 'foo' }],
    ['gateway', { name: 'foo' }],
    ['module', { name: 'foo' }],
    ['class', { name: 'foo' }],
    ['filter', { name: 'foo' }],
    ['guard', { name: 'foo' }],
    ['pipe', { name: 'foo' }],
    ['interceptor', { name: 'foo' }],
    ['middleware', { name: 'foo' }],
    ['resource', { name: 'foo' }],
    ['resource', { name: 'foo', type: 'graphql-code-first' }],
    ['resource', { name: 'foo', type: 'graphql-schema-first' }],
    ['resource', { name: 'foo', type: 'microservice' }],
    ['resource', { name: 'foo', type: 'ws' }],
    ['resource', { name: 'foo', crud: false }],
  ];

  describe('in an ESM project', () => {
    it('should emit .js extensions for the generated application itself', async () => {
      const tree = await app('esm');

      const specifiers = relativeSpecifiers(tree);
      expect(specifiers.length).toBeGreaterThan(0);
      for (const [file, specifier] of specifiers) {
        expect(`${file}: ${specifier}`).toMatch(/\.js$/);
      }
    });

    for (const [schematic, options] of schematics) {
      const label = options.type ? `${schematic} (${options.type})` : schematic;

      it(`should emit .js extensions for every relative import of \`${label}\``, async () => {
        let tree = await app('esm');
        tree = await runner.runSchematic(schematic, options, tree);

        const specifiers = relativeSpecifiers(tree);
        expect(specifiers.length).toBeGreaterThan(0);
        for (const [file, specifier] of specifiers) {
          expect(`${file}: ${specifier}`).toMatch(/\.js$/);
        }
      });
    }
  });

  describe('workspace schematics in an ESM project', () => {
    it('should emit .js extensions for every relative import of `library`', async () => {
      let tree = await app('esm');
      tree = await runner.runSchematic(
        'library',
        { name: 'shared', prefix: 'app' },
        tree,
      );

      const specifiers = relativeSpecifiers(tree).filter(([file]) =>
        file.startsWith('/libs/'),
      );
      expect(specifiers.length).toBeGreaterThan(0);
      for (const [file, specifier] of specifiers) {
        expect(`${file}: ${specifier}`).toMatch(/\.js$/);
      }
    });

    it('should emit .js extensions for every relative import of `sub-app`', async () => {
      let tree = await app('esm');
      tree = await runner.runSchematic('sub-app', { name: 'admin' }, tree);

      const specifiers = relativeSpecifiers(tree).filter(([file]) =>
        file.startsWith('/apps/'),
      );
      expect(specifiers.length).toBeGreaterThan(0);
      for (const [file, specifier] of specifiers) {
        expect(`${file}: ${specifier}`).toMatch(/\.js$/);
      }
    });
  });

  describe('in a CJS project', () => {
    it('should emit extensionless imports for the generated application itself', async () => {
      const tree = await app('cjs');

      const specifiers = relativeSpecifiers(tree);
      expect(specifiers.length).toBeGreaterThan(0);
      for (const [file, specifier] of specifiers) {
        expect(`${file}: ${specifier}`).not.toMatch(/\.js$/);
      }
    });

    for (const [schematic, options] of schematics) {
      const label = options.type ? `${schematic} (${options.type})` : schematic;

      it(`should emit extensionless relative imports for \`${label}\``, async () => {
        let tree = await app('cjs');
        tree = await runner.runSchematic(schematic, options, tree);

        const specifiers = relativeSpecifiers(tree);
        expect(specifiers.length).toBeGreaterThan(0);
        for (const [file, specifier] of specifiers) {
          expect(`${file}: ${specifier}`).not.toMatch(/\.js$/);
        }
      });
    }
  });
});
