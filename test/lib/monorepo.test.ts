import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { ApplicationOptions } from '../../src/lib/application/application.schema.js';

const readJson = (tree: UnitTestTree, filePath: string) =>
  tree.readJson(filePath) as Record<string, any>;

describe('Monorepo workspace schematics', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  const app = async (type: 'esm' | 'cjs' = 'cjs'): Promise<UnitTestTree> =>
    runner.runSchematic('application', {
      name: '',
      type,
    } as ApplicationOptions);

  const addLibrary = (tree: UnitTestTree, name = 'shared') =>
    runner.runSchematic('library', { name, prefix: '@app' }, tree);

  const addApp = (tree: UnitTestTree, name = 'admin') =>
    runner.runSchematic('sub-app', { name }, tree);

  describe('library path aliases', () => {
    it('should register the alias in the root tsconfig', async () => {
      let tree = await app();
      tree = await addLibrary(tree);

      const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
      expect(paths).toHaveProperty('@app/shared');
      expect(paths['@app/shared']).toEqual(['./libs/shared/src']);
      expect(paths['@app/shared/*']).toEqual(['./libs/shared/src/*']);
    });

    it('should survive a subsequent sub-app generation', async () => {
      let tree = await app();
      tree = await addLibrary(tree);
      tree = await addApp(tree);

      const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
      expect(paths).toHaveProperty('@app/shared');
      expect(paths['@app/shared']).toEqual(['./libs/shared/src']);
    });

    it('should be registered when the library comes after the sub-app', async () => {
      let tree = await app();
      tree = await addApp(tree);
      tree = await addLibrary(tree);

      const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
      expect(paths).toHaveProperty('@app/shared');
    });

    it('should accumulate aliases for several libraries', async () => {
      let tree = await app();
      tree = await addLibrary(tree, 'one');
      tree = await addLibrary(tree, 'two');
      tree = await addApp(tree);

      const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
      expect(paths).toHaveProperty('@app/one');
      expect(paths).toHaveProperty('@app/two');
    });

    it('should preserve aliases written by hand', async () => {
      let tree = await app();
      tree.overwrite(
        '/tsconfig.json',
        JSON.stringify({
          compilerOptions: {
            baseUrl: './',
            paths: { '~/*': ['src/*'] },
          },
        }),
      );
      tree = await addApp(tree);

      const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
      expect(paths['~/*']).toEqual(['src/*']);
    });

    it('should drop the deprecated baseUrl during the monorepo conversion', async () => {
      let tree = await app();
      tree = await addApp(tree);

      expect(
        readJson(tree, '/tsconfig.json').compilerOptions.baseUrl,
      ).toBeUndefined();
    });
  });

  describe('nest-cli.json', () => {
    it('should register the library as a project', async () => {
      let tree = await app();
      tree = await addLibrary(tree);

      const config = readJson(tree, '/nest-cli.json');
      expect(config.projects).toHaveProperty('shared');
      expect(config.projects.shared.type).toBe('library');
      expect(config.projects.shared.root).toBe('libs/shared');
    });

    it('should register the sub-app as a project and flag the monorepo', async () => {
      let tree = await app();
      tree = await addApp(tree);

      const config = readJson(tree, '/nest-cli.json');
      expect(config.monorepo).toBe(true);
      expect(config.projects).toHaveProperty('admin');
      expect(config.projects.admin.type).toBe('application');
    });

    it('should use rspack as the builder', async () => {
      let tree = await app();
      tree = await addApp(tree);

      expect(readJson(tree, '/nest-cli.json').compilerOptions.builder).toBe(
        'rspack',
      );
    });
  });

  describe('solution-style tsconfig', () => {
    it('should reference both the original app and the new sub-app', async () => {
      let tree = await app();
      tree = await addApp(tree);

      const tsconfig = readJson(tree, '/tsconfig.json');
      expect(tsconfig.files).toEqual([]);
      expect(tsconfig.references).toContainEqual({
        path: './apps/admin/tsconfig.app.json',
      });
      expect(tsconfig.references.length).toBeGreaterThanOrEqual(2);
    });

    it('should not duplicate references when adding several sub-apps', async () => {
      let tree = await app();
      tree = await addApp(tree, 'one');
      tree = await addApp(tree, 'two');

      const references = readJson(tree, '/tsconfig.json').references.map(
        (ref: { path: string }) => ref.path,
      );

      expect(references.length).toEqual(new Set(references).size);
      expect(references).toContain('./apps/one/tsconfig.app.json');
      expect(references).toContain('./apps/two/tsconfig.app.json');
    });
  });

  describe('generated library sources', () => {
    it('should place the library under libs/<name>/src', async () => {
      let tree = await app();
      tree = await addLibrary(tree);

      expect(tree.files).toContain('/libs/shared/src/shared.module.ts');
      expect(tree.files).toContain('/libs/shared/src/shared.service.ts');
      expect(tree.files).toContain('/libs/shared/src/index.ts');
      expect(tree.files).toContain('/libs/shared/tsconfig.lib.json');
    });

    it('should map the library into the e2e jest config', async () => {
      let tree = await app('cjs');
      tree = await addLibrary(tree);

      const mapper = readJson(tree, '/test/jest-e2e.json').moduleNameMapper;
      expect(Object.keys(mapper).join(' ')).toContain('@app/shared');
    });
  });
});
