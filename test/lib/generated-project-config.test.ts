import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { ApplicationOptions } from '../../src/lib/application/application.schema.js';

describe('Generated project configuration', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  const app = async (
    type: 'esm' | 'cjs',
    extra: Partial<ApplicationOptions> = {},
  ): Promise<UnitTestTree> =>
    runner.runSchematic('application', {
      name: '',
      type,
      ...extra,
    } as ApplicationOptions);

  describe('CJS (jest) application', () => {
    it('should resolve path aliases from tsconfig.json rather than hardcoding them', async () => {
      const tree = await app('cjs');
      const jestConfig = tree.readContent('/jest.config.ts');

      expect(jestConfig).toContain("from 'ts-jest'");
      expect(jestConfig).toContain('pathsToModuleNameMapper');
      expect(jestConfig).toContain('./tsconfig.json');
      expect(jestConfig).toContain('moduleNameMapper');
    });

    it('should root jest at the project so libs and apps are discoverable', async () => {
      const tree = await app('cjs');

      expect(tree.readContent('/jest.config.ts')).toContain("rootDir: '.'");
    });

    it('should keep the e2e jest config alongside the e2e tests', async () => {
      const tree = await app('cjs');

      expect(tree.files).toContain('/test/jest-e2e.json');
      expect(JSON.parse(tree.readContent('/test/jest-e2e.json'))).toMatchObject(
        {
          testRegex: '.e2e-spec.ts$',
        },
      );
    });
  });

  describe('ESM (vitest) application', () => {
    it('should resolve tsconfig path aliases through the vitest plugin', async () => {
      const tree = await app('esm');

      for (const config of ['/vitest.config.ts', '/vitest.config.e2e.ts']) {
        const content = tree.readContent(config);
        expect(content).toContain("from 'vite-tsconfig-paths'");
        expect(content).toContain('tsconfigPaths()');
      }
    });

    it('should declare the vite-tsconfig-paths dependency it imports', async () => {
      const tree = await app('esm');
      const packageJson = JSON.parse(tree.readContent('/package.json'));

      expect(packageJson.devDependencies).toHaveProperty('vite-tsconfig-paths');
    });

    it('should ship a coverage provider for the test:cov script', async () => {
      const tree = await app('esm');
      const packageJson = JSON.parse(tree.readContent('/package.json'));

      expect(packageJson.scripts['test:cov']).toContain('--coverage');
      expect(packageJson.devDependencies).toHaveProperty('@vitest/coverage-v8');
    });

    it('should not carry any jest configuration', async () => {
      const tree = await app('esm');
      const packageJson = JSON.parse(tree.readContent('/package.json'));

      expect(packageJson).not.toHaveProperty('jest');
      expect(packageJson.devDependencies).not.toHaveProperty('jest');
      expect(tree.files).not.toContain('/jest.config.ts');
      expect(tree.files).not.toContain('/test/jest-e2e.json');
    });

    it('should mark the package as an ES module', async () => {
      const tree = await app('esm');

      expect(JSON.parse(tree.readContent('/package.json')).type).toBe('module');
    });
  });

  describe('@nestjs/observe integration', () => {
    const variants: Array<[string, ApplicationOptions, string]> = [
      ['esm', { name: 'cats-app', type: 'esm' } as ApplicationOptions, 'ts'],
      ['cjs', { name: 'cats-app', type: 'cjs' } as ApplicationOptions, 'ts'],
      ['js', { name: 'cats-app', language: 'js' } as ApplicationOptions, 'js'],
    ];

    describe.each(variants)('%s application', (_label, options, ext) => {
      const generate = (observe?: boolean) =>
        runner.runSchematic('application', {
          ...options,
          ...(observe === undefined ? {} : { observe }),
        } as ApplicationOptions);

      it('should not reference @nestjs/observe by default', async () => {
        const tree = await generate();
        const packageJson = JSON.parse(
          tree.readContent('/cats-app/package.json'),
        );

        expect(packageJson.dependencies).not.toHaveProperty('@nestjs/observe');
        expect(
          tree.readContent(`/cats-app/src/app.module.${ext}`),
        ).not.toContain('createObserveModule');
        expect(tree.readContent(`/cats-app/src/main.${ext}`)).not.toContain(
          'ObserveInstrument',
        );
      });

      it('should keep an empty imports array when observe is disabled', async () => {
        const tree = await generate(false);

        expect(tree.readContent(`/cats-app/src/app.module.${ext}`)).toContain(
          'imports: [],',
        );
      });

      it('should create the module pair when observe is enabled', async () => {
        const tree = await generate(true);
        const appModule = tree.readContent(`/cats-app/src/app.module.${ext}`);

        expect(appModule).toContain(
          "import { createObserveModule } from '@nestjs/observe';",
        );
        expect(appModule).toContain(
          'export const { ObserveModule, ObserveInstrument } = createObserveModule();',
        );
      });

      it('should register ObserveModule.forRoot with the app as serviceId', async () => {
        const tree = await generate(true);
        const appModule = tree.readContent(`/cats-app/src/app.module.${ext}`);

        expect(appModule).toContain('ObserveModule.forRoot({');
        expect(appModule).toContain("appKey: 'YOUR_APP_KEY',");
        expect(appModule).toContain("appSecret: 'YOUR_APP_SECRET',");
        expect(appModule).toContain("serviceId: 'cats-app',");
        expect(appModule).toContain('observe.nestjs.com');
      });

      it('should pass the instrument to NestFactory.create', async () => {
        const tree = await generate(true);
        const main = tree.readContent(`/cats-app/src/main.${ext}`);

        expect(main).toContain('ObserveInstrument }');
        expect(main).toContain('NestFactory.create(AppModule, {');
        expect(main).toContain('instrument: ObserveInstrument,');
      });

      it('should install @nestjs/observe when enabled', async () => {
        const tree = await generate(true);
        const packageJson = JSON.parse(
          tree.readContent('/cats-app/package.json'),
        );

        expect(packageJson.dependencies).toHaveProperty('@nestjs/observe');
      });

      it('should still emit a valid package.json when enabled', async () => {
        const tree = await generate(true);

        expect(() =>
          JSON.parse(tree.readContent('/cats-app/package.json')),
        ).not.toThrow();
      });
    });

    it('should derive serviceId from the normalized application name', async () => {
      const tree = await runner.runSchematic('application', {
        name: 'awesomeProject',
        type: 'esm',
        observe: true,
      } as ApplicationOptions);

      expect(tree.readContent('/awesome-project/src/app.module.ts')).toContain(
        "serviceId: 'awesome-project',",
      );
    });

    it('should keep the ESM import suffixes when observe is enabled', async () => {
      const tree = await runner.runSchematic('application', {
        name: 'cats-app',
        type: 'esm',
        observe: true,
      } as ApplicationOptions);

      expect(tree.readContent('/cats-app/src/main.ts')).toContain(
        "from './app.module.js'",
      );
    });
  });

  describe('deploy script', () => {
    it.each(['esm', 'cjs'] as const)(
      'should add a `deploy` script backed by @nestjs/mau for the %s application',
      async (type) => {
        const tree = await app(type);
        const packageJson = JSON.parse(tree.readContent('/package.json'));

        expect(packageJson.scripts.deploy).toBe('nest deploy');
        expect(packageJson.devDependencies).toHaveProperty('@nestjs/mau');
      },
    );

    it('should add a `deploy` script for the js application', async () => {
      const tree: UnitTestTree = await runner.runSchematic('application', {
        name: '',
        language: 'js',
      } as ApplicationOptions);
      const packageJson = JSON.parse(tree.readContent('/package.json'));

      expect(packageJson.scripts.deploy).toBe('nest deploy');
      expect(packageJson.devDependencies).toHaveProperty('@nestjs/mau');
    });
  });

  describe('build tsconfig', () => {
    it.each(['esm', 'cjs'] as const)(
      'should scope the %s build to src so the entry point stays at dist/main',
      async (type) => {
        const tree = await app(type);
        const buildConfig = JSON.parse(
          tree.readContent('/tsconfig.build.json'),
        );

        expect(buildConfig.include).toEqual(['src']);
        expect(
          JSON.parse(tree.readContent('/package.json')).scripts['start:prod'],
        ).toBe('node dist/main');
      },
    );

    it.each(['esm', 'cjs'] as const)(
      'should exclude spec files from the %s build',
      async (type) => {
        const tree = await app(type);

        expect(
          JSON.parse(tree.readContent('/tsconfig.build.json')).exclude,
        ).toContain('**/*spec.ts');
      },
    );
  });

  describe('e2e templates', () => {
    const expectCallableSupertest = (content: string) => {
      // A namespace import is not callable under NodeNext ESM interop.
      expect(content).not.toContain("import * as request from 'supertest'");
      expect(content).toContain("import request from 'supertest'");
    };

    it.each(['esm', 'cjs'] as const)(
      'should use a callable supertest import in the %s application',
      async (type) => {
        const tree = await app(type);

        expectCallableSupertest(tree.readContent('/test/app.e2e-spec.ts'));
      },
    );

    it.each(['esm', 'cjs'] as const)(
      'should close the application after each %s e2e test',
      async (type) => {
        const tree = await app(type);

        expect(tree.readContent('/test/app.e2e-spec.ts')).toContain(
          'await app.close()',
        );
      },
    );

    it.each(['esm', 'cjs'] as const)(
      'should type the %s e2e application with the supertest App generic',
      async (type) => {
        const tree = await app(type);

        expect(tree.readContent('/test/app.e2e-spec.ts')).toContain(
          'INestApplication<App>',
        );
      },
    );

    it.each(['esm', 'cjs'] as const)(
      'should use a callable supertest import in a %s sub-app',
      async (type) => {
        let tree = await app(type);
        tree = await runner.runSchematic('sub-app', { name: 'admin' }, tree);

        expectCallableSupertest(
          tree.readContent('/apps/admin/test/app.e2e-spec.ts'),
        );
      },
    );
  });
});
