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

  const patchJson = (
    tree: UnitTestTree,
    filePath: string,
    mutate: (json: any) => void,
  ) => {
    const json = readJson(tree, filePath);
    mutate(json);
    tree.overwrite(filePath, JSON.stringify(json, null, 2));
  };

  const patchCli = (tree: UnitTestTree, mutate: (json: any) => void) =>
    patchJson(tree, '/nest-cli.json', mutate);

  const patchPackageJson = (tree: UnitTestTree, mutate: (json: any) => void) =>
    patchJson(tree, '/package.json', mutate);

  /**
   * Converts the workspace with one `nest g app`, then pins the builder and
   * adds a second app so `start:prod` is written against it - the conversion
   * itself always forces rspack.
   */
  const setBuilder = async (tree: UnitTestTree, builder: unknown) => {
    tree = await addApp(tree, 'first');
    patchCli(tree, (cli) => {
      cli.compilerOptions.builder = builder;
    });
    return addApp(tree, 'second');
  };

  describe('library path aliases', () => {
    it('should register the alias in the root tsconfig', async () => {
      let tree = await app();
      tree = await addLibrary(tree);

      const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
      expect(paths).toHaveProperty('@app/shared');
      expect(paths['@app/shared']).toEqual(['./libs/shared/src']);
      expect(paths['@app/shared/*']).toEqual(['./libs/shared/src/*']);
    });

    it('should point at the entry file for ESM so nodenext can resolve it', async () => {
      let tree = await app('esm');
      tree = await addLibrary(tree);

      const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
      expect(paths['@app/shared']).toEqual(['./libs/shared/src/index.ts']);
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

    it('should keep the deep alias pointing at the directory in both module systems', async () => {
      for (const type of ['cjs', 'esm'] as const) {
        let tree = await app(type);
        tree = await addLibrary(tree);

        const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
        // Only the bare alias resolves through an index; a subpath already
        // names a file, so it stays a directory prefix.
        expect(paths['@app/shared/*']).toEqual(['./libs/shared/src/*']);
      }
    });

    it('should point every ESM library alias at its entry file', async () => {
      let tree = await app('esm');
      tree = await addLibrary(tree, 'one');
      tree = await addLibrary(tree, 'two');

      const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
      expect(paths['@app/one']).toEqual(['./libs/one/src/index.ts']);
      expect(paths['@app/two']).toEqual(['./libs/two/src/index.ts']);
    });

    it('should honour a custom prefix', async () => {
      let tree = await app('esm');
      tree = await runner.runSchematic(
        'library',
        { name: 'shared', prefix: '@acme' },
        tree,
      );

      const paths = readJson(tree, '/tsconfig.json').compilerOptions.paths;
      expect(paths['@acme/shared']).toEqual(['./libs/shared/src/index.ts']);
      expect(paths['@acme/shared/*']).toEqual(['./libs/shared/src/*']);
    });

    it('should name a file the library actually generates', async () => {
      for (const type of ['cjs', 'esm'] as const) {
        let tree = await app(type);
        tree = await addLibrary(tree);

        const [target] = readJson(tree, '/tsconfig.json').compilerOptions.paths[
          '@app/shared'
        ];
        const resolved = `/${target.replace(/^\.\//, '')}`;
        const candidates =
          type === 'esm' ? [resolved] : [`${resolved}/index.ts`];

        // An alias that names a path no file sits at is the failure mode this
        // guards: `tsc` reports it only at build time.
        expect(candidates.some((file) => tree.files.includes(file))).toBe(true);
      }
    });

    it('should drop the deprecated baseUrl during the monorepo conversion', async () => {
      let tree = await app();
      tree = await addApp(tree);

      expect(
        readJson(tree, '/tsconfig.json').compilerOptions.baseUrl,
      ).toBeUndefined();
    });
  });

  describe('project tsconfig', () => {
    it('should keep sibling library sources inside the program', async () => {
      let tree = await app();
      tree = await addLibrary(tree);

      const lib = readJson(tree, '/libs/shared/tsconfig.lib.json');
      expect(lib.compilerOptions.rootDir).toBe('../..');
      expect(lib.compilerOptions.composite).toBeUndefined();
      expect(lib.compilerOptions.outDir).toBe('../../dist/libs/shared');

      tree = await addApp(tree);

      const appConfig = readJson(tree, '/apps/admin/tsconfig.app.json');
      expect(appConfig.compilerOptions.rootDir).toBe('../..');
      expect(appConfig.compilerOptions.composite).toBeUndefined();
      expect(appConfig.compilerOptions.outDir).toBe('../../dist/apps/admin');

      // `nest g app` also moves the original app into apps/<workspace name>,
      // and that copy comes from the workspace template.
      const workspaceApp = readJson(
        tree,
        '/apps/nestjs-schematics/tsconfig.app.json',
      );
      expect(workspaceApp.compilerOptions.rootDir).toBe('../..');
      expect(workspaceApp.compilerOptions.composite).toBeUndefined();
      expect(workspaceApp.compilerOptions.outDir).toBe(
        '../../dist/apps/nestjs-schematics',
      );
    });

    it('should keep every project outDir at dist/<project root>', async () => {
      let tree = await app();
      tree = await addLibrary(tree, 'one');
      tree = await addLibrary(tree, 'two');
      tree = await addApp(tree, 'api');
      tree = await addApp(tree, 'admin');

      const { projects } = readJson(tree, '/nest-cli.json');

      for (const [name, project] of Object.entries<any>(projects)) {
        const config = readJson(
          tree,
          `/${project.compilerOptions.tsConfigPath}`,
        );
        // `rootDir` is the workspace root for every project, so a per-file
        // compiler repeats the project path under `outDir`. That is the price
        // of `nest start`: it probes `<outDir>/<entryFile>` for a bundle, and
        // bundlers write `dist/<root>/<entryFile>.js` whatever the tsconfig
        // says - only `outDir: dist/<root>` lets the two meet. A shared
        // `dist` reads better but leaves `nest start` looking for
        // `dist/main.js` under the default builder.
        expect({ name, ...config.compilerOptions }).toMatchObject({
          name,
          rootDir: '../..',
          outDir: `../../dist/${project.root}`,
        });
      }
    });

    it('should inherit the workspace compiler options', async () => {
      let tree = await app();
      tree = await addLibrary(tree, 'shared');
      tree = await addApp(tree, 'admin');

      // The aliases live in the root tsconfig, so a project that did not
      // extend it could not resolve them.
      expect(readJson(tree, '/libs/shared/tsconfig.lib.json').extends).toBe(
        '../../tsconfig.json',
      );
      expect(readJson(tree, '/apps/admin/tsconfig.app.json').extends).toBe(
        '../../tsconfig.json',
      );
    });

    it('should build only its own sources, excluding specs', async () => {
      let tree = await app();
      tree = await addLibrary(tree, 'shared');
      tree = await addApp(tree, 'admin');

      for (const config of [
        '/libs/shared/tsconfig.lib.json',
        '/apps/admin/tsconfig.app.json',
      ]) {
        const json = readJson(tree, config);
        // `include` stays narrow even though `rootDir` is the workspace root:
        // sibling sources enter the program through the aliases instead.
        expect(json.include).toEqual(['src/**/*']);
        expect(json.exclude).toContain('node_modules');
        expect(json.exclude).toContain('dist');
      }
    });

    it('should emit declarations for libraries but not applications', async () => {
      let tree = await app();
      tree = await addLibrary(tree, 'shared');
      tree = await addApp(tree, 'admin');

      expect(
        readJson(tree, '/libs/shared/tsconfig.lib.json').compilerOptions
          .declaration,
      ).toBe(true);
      // The root tsconfig turns declarations on, so an app has to opt out
      // explicitly or it emits `.d.ts` for every sibling it pulls in.
      expect(
        readJson(tree, '/apps/admin/tsconfig.app.json').compilerOptions
          .declaration,
      ).toBe(false);
      expect(
        readJson(tree, '/apps/nestjs-schematics/tsconfig.app.json')
          .compilerOptions.declaration,
      ).toBe(false);
    });

    it('should not declare projects composite', async () => {
      let tree = await app();
      tree = await addLibrary(tree, 'shared');
      tree = await addApp(tree, 'admin');

      // `composite` forces `rootDir` to cover only the project's own files,
      // which is what made a sibling alias fail to compile.
      for (const config of [
        '/libs/shared/tsconfig.lib.json',
        '/apps/admin/tsconfig.app.json',
        '/apps/nestjs-schematics/tsconfig.app.json',
      ]) {
        expect(
          readJson(tree, config).compilerOptions.composite,
        ).toBeUndefined();
      }
    });
  });

  describe('test:e2e script', () => {
    it('should run the e2e tests of every CommonJS app', async () => {
      let tree = await app('cjs');
      tree = await addApp(tree, 'admin');

      expect(readJson(tree, '/package.json').scripts['test:e2e']).toBe(
        'node --experimental-vm-modules ./node_modules/jest/bin/jest.js --projects "./apps/nestjs-schematics/test/jest-e2e.json" "./apps/admin/test/jest-e2e.json"',
      );

      tree = await addApp(tree, 'billing');
      expect(readJson(tree, '/package.json').scripts['test:e2e']).toBe(
        'node --experimental-vm-modules ./node_modules/jest/bin/jest.js --projects "./apps/nestjs-schematics/test/jest-e2e.json" "./apps/admin/test/jest-e2e.json" "./apps/billing/test/jest-e2e.json"',
      );
    });

    it('should leave the vitest command alone, since `test` also sits inside `vitest`', async () => {
      let tree = await app('esm');
      tree = await addApp(tree, 'admin');

      expect(readJson(tree, '/package.json').scripts['test:e2e']).toBe(
        'vitest run --config ./vitest.config.e2e.ts',
      );
    });

    it.each([
      [
        'jest --config ./test/jest-e2e.json --setupFiles ./src/test/setup.ts',
        'jest --config ./apps/nestjs-schematics/test/jest-e2e.json --setupFiles ./src/test/setup.ts',
      ],
      [
        'jest --config=test/jest-e2e.json --rootDir ./test',
        'jest --config=apps/nestjs-schematics/test/jest-e2e.json --rootDir ./apps/nestjs-schematics/test',
      ],
      [
        'npm test -- --config "./test/jest-e2e.json"',
        'npm test -- --config "./apps/nestjs-schematics/test/jest-e2e.json"',
      ],
      [
        'jest --config ./test-utils/jest-e2e.json',
        'jest --config ./test-utils/jest-e2e.json',
      ],
    ])(
      'should rewrite only paths into the root test directory in `%s`',
      async (script, expected) => {
        let tree = await app('cjs');
        patchPackageJson(tree, (pkg) => {
          pkg.scripts['test:e2e'] = script;
        });

        tree = await addApp(tree, 'admin');

        expect(readJson(tree, '/package.json').scripts['test:e2e']).toBe(
          expected,
        );
      },
    );
  });

  describe('start:prod script', () => {
    it('should keep the flat entry for bundlers', async () => {
      let tree = await app();
      tree = await addApp(tree, 'api');

      const scripts = readJson(tree, '/package.json').scripts;
      expect(scripts['start:prod']).toBe(
        'node dist/apps/nestjs-schematics/main',
      );
    });

    it('should use the nested entry when the builder is tsc', async () => {
      let tree = await app();
      // first `nest g app` converts the workspace (and forces the default builder)
      tree = await addApp(tree, 'first');
      const cli = readJson(tree, '/nest-cli.json');
      cli.compilerOptions.builder = 'tsc';
      tree.overwrite('/nest-cli.json', JSON.stringify(cli, null, 2));

      // once it is a monorepo, the existing builder is kept
      tree = await addApp(tree, 'second');

      const scripts = readJson(tree, '/package.json').scripts;
      expect(scripts['start:prod']).toBe(
        'node dist/apps/nestjs-schematics/apps/nestjs-schematics/src/main',
      );
    });

    it('should not fall through to a later config file', async () => {
      let tree = await app();
      tree = await addApp(tree, 'first');

      // The CLI only loads the first config file it finds, so a builder
      // declared in `.nestcli.json` must not win over `nest-cli.json`.
      const cli = readJson(tree, '/nest-cli.json');
      cli.compilerOptions.builder = 'rspack';
      tree.overwrite('/nest-cli.json', JSON.stringify(cli, null, 2));
      tree.create(
        '/.nestcli.json',
        JSON.stringify({ compilerOptions: { builder: 'tsc' } }, null, 2),
      );

      tree = await addApp(tree, 'second');

      const scripts = readJson(tree, '/package.json').scripts;
      expect(scripts['start:prod']).toBe(
        'node dist/apps/nestjs-schematics/main',
      );
    });

    it.each(['tsc', 'swc'])(
      'should use the nested entry for the %s builder',
      async (builder) => {
        let tree = await app();
        tree = await setBuilder(tree, builder);

        const scripts = readJson(tree, '/package.json').scripts;
        // Both mirror the source tree under `rootDir` - the workspace root -
        // into the project's own outDir, so the project path appears twice.
        expect(scripts['start:prod']).toBe(
          'node dist/apps/nestjs-schematics/apps/nestjs-schematics/src/main',
        );
      },
    );

    it.each(['rspack', 'webpack'])(
      'should use the flat entry for the %s builder',
      async (builder) => {
        let tree = await app();
        tree = await setBuilder(tree, builder);

        const scripts = readJson(tree, '/package.json').scripts;
        expect(scripts['start:prod']).toBe(
          'node dist/apps/nestjs-schematics/main',
        );
      },
    );

    it('should read the builder from its object form', async () => {
      let tree = await app();
      // A bundler, so the expectation differs from the fallback: reading the
      // object as "no builder" would give the tsc-shaped path instead.
      tree = await setBuilder(tree, { type: 'rspack', options: {} });

      const scripts = readJson(tree, '/package.json').scripts;
      expect(scripts['start:prod']).toBe(
        'node dist/apps/nestjs-schematics/main',
      );
    });

    it('should ignore a builder object with no type', async () => {
      let tree = await app();
      tree = await setBuilder(tree, { options: {} });

      const scripts = readJson(tree, '/package.json').scripts;
      expect(scripts['start:prod']).toBe(
        'node dist/apps/nestjs-schematics/apps/nestjs-schematics/src/main',
      );
    });

    it('should assume tsc when no builder is configured', async () => {
      let tree = await app();
      tree = await addApp(tree, 'first');
      patchCli(tree, (cli) => delete cli.compilerOptions.builder);

      tree = await addApp(tree, 'second');

      // `getBuilder` in the CLI falls back to tsc, not to the rspack the
      // conversion writes.
      const scripts = readJson(tree, '/package.json').scripts;
      expect(scripts['start:prod']).toBe(
        'node dist/apps/nestjs-schematics/apps/nestjs-schematics/src/main',
      );
    });

    it('should stay put across repeated sub-app generations', async () => {
      let tree = await app();
      tree = await addApp(tree, 'one');
      const afterFirst = readJson(tree, '/package.json').scripts['start:prod'];

      tree = await addApp(tree, 'two');
      tree = await addApp(tree, 'three');

      expect(readJson(tree, '/package.json').scripts['start:prod']).toBe(
        afterFirst,
      );
    });

    it('should always point at the workspace app, not the new sub-app', async () => {
      let tree = await app();
      tree = await addApp(tree, 'admin');

      // `start:prod` runs the app the workspace was created as; a new sub-app
      // is started with `nest start <name>`.
      expect(readJson(tree, '/package.json').scripts['start:prod']).toContain(
        'nestjs-schematics',
      );
      expect(
        readJson(tree, '/package.json').scripts['start:prod'],
      ).not.toContain('admin');
    });

    it('should leave a customised start:prod alone', async () => {
      let tree = await app();
      const custom = 'node --enable-source-maps dist/main.js';
      patchPackageJson(tree, (pkg) => {
        pkg.scripts['start:prod'] = custom;
      });

      tree = await addApp(tree, 'admin');

      expect(readJson(tree, '/package.json').scripts['start:prod']).toBe(
        custom,
      );
    });

    it('should not add start:prod when the workspace has none', async () => {
      let tree = await app();
      patchPackageJson(tree, (pkg) => {
        delete pkg.scripts['start:prod'];
      });

      tree = await addApp(tree, 'admin');

      expect(
        readJson(tree, '/package.json').scripts['start:prod'],
      ).toBeUndefined();
    });

    it('should not be disturbed by generating a library', async () => {
      let tree = await app();
      tree = await addApp(tree, 'admin');
      const before = readJson(tree, '/package.json').scripts['start:prod'];

      tree = await addLibrary(tree, 'shared');

      expect(readJson(tree, '/package.json').scripts['start:prod']).toBe(
        before,
      );
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

    it('should keep deleteOutDir on through the monorepo conversion', async () => {
      let tree = await app();
      expect(
        readJson(tree, '/nest-cli.json').compilerOptions.deleteOutDir,
      ).toBe(true);

      tree = await addApp(tree, 'one');
      tree = await addApp(tree, 'two');
      tree = await addLibrary(tree, 'shared');

      // Safe only because every project owns its outDir: the CLI removes the
      // whole directory the project tsconfig names before each build.
      expect(
        readJson(tree, '/nest-cli.json').compilerOptions.deleteOutDir,
      ).toBe(true);
    });

    it('should respect a deleteOutDir the user turned off', async () => {
      let tree = await app();
      tree = await addApp(tree, 'one');
      patchCli(tree, (cli) => {
        cli.compilerOptions.deleteOutDir = false;
      });

      tree = await addApp(tree, 'two');

      expect(
        readJson(tree, '/nest-cli.json').compilerOptions.deleteOutDir,
      ).toBe(false);
    });

    it('should keep the builder a monorepo already declares', async () => {
      let tree = await app();
      tree = await addApp(tree, 'one');
      patchCli(tree, (cli) => {
        cli.compilerOptions.builder = 'tsc';
      });

      tree = await addApp(tree, 'two');

      expect(readJson(tree, '/nest-cli.json').compilerOptions.builder).toBe(
        'tsc',
      );
    });

    it('should point each project at its own tsconfig', async () => {
      let tree = await app();
      tree = await addLibrary(tree, 'shared');
      tree = await addApp(tree, 'admin');

      const { projects } = readJson(tree, '/nest-cli.json');
      expect(projects.admin.compilerOptions.tsConfigPath).toBe(
        'apps/admin/tsconfig.app.json',
      );
      expect(projects.shared.compilerOptions.tsConfigPath).toBe(
        'libs/shared/tsconfig.lib.json',
      );
      expect(projects.shared.entryFile).toBe('index');
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
