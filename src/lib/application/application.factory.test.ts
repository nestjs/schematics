import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { ApplicationOptions } from './application.schema.js';

describe('Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  describe('when only the name is supplied', () => {
    it('should manage basic (ie., cross-platform) name', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/project/.oxlintrc.json',
          '/project/.gitattributes',
          '/project/.gitignore',
          '/project/.prettierrc',
          '/project/README.md',
          '/project/AGENTS.md',
          '/project/jest.config.ts',
          '/project/nest-cli.json',
          '/project/package.json',
          '/project/tsconfig.build.json',
          '/project/tsconfig.json',
          '/project/src/app.controller.spec.ts',
          '/project/src/app.controller.ts',
          '/project/src/app.module.ts',
          '/project/src/app.service.ts',
          '/project/src/main.ts',
          '/project/test/app.e2e-spec.ts',
          '/project/test/jest-e2e.json',
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/project/package.json')),
      ).toMatchObject({
        name: 'project',
      });

      expect(
        JSON.parse(tree.readContent('/project/tsconfig.json')),
      ).toMatchObject({
        compilerOptions: {
          types: ['node', 'jest'],
        },
      });
    });
    it('should manage name with dots in it', async () => {
      const options: ApplicationOptions = {
        name: 'project.foo.bar',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          `/project.foo.bar/.oxlintrc.json`,
          `/project.foo.bar/.gitattributes`,
          `/project.foo.bar/.gitignore`,
          `/project.foo.bar/.prettierrc`,
          `/project.foo.bar/README.md`,
          `/project.foo.bar/AGENTS.md`,
          `/project.foo.bar/jest.config.ts`,
          `/project.foo.bar/nest-cli.json`,
          `/project.foo.bar/package.json`,
          `/project.foo.bar/tsconfig.build.json`,
          `/project.foo.bar/tsconfig.json`,
          `/project.foo.bar/src/app.controller.spec.ts`,
          `/project.foo.bar/src/app.controller.ts`,
          `/project.foo.bar/src/app.module.ts`,
          `/project.foo.bar/src/app.service.ts`,
          `/project.foo.bar/src/main.ts`,
          `/project.foo.bar/test/app.e2e-spec.ts`,
          `/project.foo.bar/test/jest-e2e.json`,
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/project.foo.bar/package.json')),
      ).toMatchObject({
        name: 'project.foo.bar',
      });
    });
    it('should manage name to normalize from camel case name', async () => {
      const options: ApplicationOptions = {
        name: 'awesomeProject',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/awesome-project/.oxlintrc.json',
          '/awesome-project/.gitattributes',
          '/awesome-project/.gitignore',
          '/awesome-project/.prettierrc',
          '/awesome-project/README.md',
          '/awesome-project/AGENTS.md',
          '/awesome-project/jest.config.ts',
          '/awesome-project/nest-cli.json',
          '/awesome-project/package.json',
          '/awesome-project/tsconfig.build.json',
          '/awesome-project/tsconfig.json',
          '/awesome-project/src/app.controller.spec.ts',
          '/awesome-project/src/app.controller.ts',
          '/awesome-project/src/app.module.ts',
          '/awesome-project/src/app.service.ts',
          '/awesome-project/src/main.ts',
          '/awesome-project/test/app.e2e-spec.ts',
          '/awesome-project/test/jest-e2e.json',
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/awesome-project/package.json')),
      ).toMatchObject({
        name: 'awesome-project',
      });
    });
    it('should keep underscores', async () => {
      const options: ApplicationOptions = {
        name: '_awesomeProject',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/_awesome-project/.oxlintrc.json',
          '/_awesome-project/.gitattributes',
          '/_awesome-project/.gitignore',
          '/_awesome-project/.prettierrc',
          '/_awesome-project/README.md',
          '/_awesome-project/AGENTS.md',
          '/_awesome-project/jest.config.ts',
          '/_awesome-project/nest-cli.json',
          '/_awesome-project/package.json',
          '/_awesome-project/tsconfig.build.json',
          '/_awesome-project/tsconfig.json',
          '/_awesome-project/src/app.controller.spec.ts',
          '/_awesome-project/src/app.controller.ts',
          '/_awesome-project/src/app.module.ts',
          '/_awesome-project/src/app.service.ts',
          '/_awesome-project/src/main.ts',
          '/_awesome-project/test/app.e2e-spec.ts',
          '/_awesome-project/test/jest-e2e.json',
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/_awesome-project/package.json')),
      ).toMatchObject({
        name: '_awesome-project',
      });
    });
    it('should manage basic name that has no scope name in it but starts with "@"', async () => {
      const options: ApplicationOptions = {
        name: '@/package',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/@/package/.oxlintrc.json',
          '/@/package/.gitattributes',
          '/@/package/.gitignore',
          '/@/package/.prettierrc',
          '/@/package/README.md',
          '/@/package/AGENTS.md',
          '/@/package/jest.config.ts',
          '/@/package/nest-cli.json',
          '/@/package/package.json',
          '/@/package/tsconfig.build.json',
          '/@/package/tsconfig.json',
          '/@/package/src/app.controller.spec.ts',
          '/@/package/src/app.controller.ts',
          '/@/package/src/app.module.ts',
          '/@/package/src/app.service.ts',
          '/@/package/src/main.ts',
          '/@/package/test/app.e2e-spec.ts',
          '/@/package/test/jest-e2e.json',
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/@/package/package.json')),
      ).toMatchObject({
        name: 'package',
      });
    });
    it('should manage the name "." (ie., current working directory)', async () => {
      const options: ApplicationOptions = {
        name: '.',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/.oxlintrc.json',
          '/.gitattributes',
          '/.gitignore',
          '/.prettierrc',
          '/README.md',
          '/AGENTS.md',
          '/jest.config.ts',
          '/nest-cli.json',
          '/package.json',
          '/tsconfig.build.json',
          '/tsconfig.json',
          '/src/app.controller.spec.ts',
          '/src/app.controller.ts',
          '/src/app.module.ts',
          '/src/app.service.ts',
          '/src/main.ts',
          '/test/app.e2e-spec.ts',
          '/test/jest-e2e.json',
        ].sort(),
      );

      expect(JSON.parse(tree.readContent('/package.json'))).toMatchObject({
        name: path.basename(process.cwd()),
      });
    });
    describe('and it meant to be a scoped package', () => {
      describe('that leads to a valid scope name', () => {
        it('should manage basic name', async () => {
          const options: ApplicationOptions = {
            name: '@scope/package',
            type: 'cjs',
          };
          const tree: UnitTestTree = await runner.runSchematic(
            'application',
            options,
          );
          const files: string[] = tree.files;
          expect(files.sort()).toEqual(
            [
              '/@scope/package/.oxlintrc.json',
              '/@scope/package/.gitattributes',
              '/@scope/package/.gitignore',
              '/@scope/package/.prettierrc',
              '/@scope/package/README.md',
              '/@scope/package/AGENTS.md',
              '/@scope/package/jest.config.ts',
              '/@scope/package/nest-cli.json',
              '/@scope/package/package.json',
              '/@scope/package/tsconfig.build.json',
              '/@scope/package/tsconfig.json',
              '/@scope/package/src/app.controller.spec.ts',
              '/@scope/package/src/app.controller.ts',
              '/@scope/package/src/app.module.ts',
              '/@scope/package/src/app.service.ts',
              '/@scope/package/src/main.ts',
              '/@scope/package/test/app.e2e-spec.ts',
              '/@scope/package/test/jest-e2e.json',
            ].sort(),
          );

          expect(
            JSON.parse(tree.readContent('/@scope/package/package.json')),
          ).toMatchObject({
            name: '@scope/package',
          });
        });
        it('should manage name with blank space right after the "@" symbol', async () => {
          const options: ApplicationOptions = {
            name: '@ /package',
            type: 'cjs',
          };
          const tree: UnitTestTree = await runner.runSchematic(
            'application',
            options,
          );
          const files: string[] = tree.files;
          expect(files.sort()).toEqual(
            [
              '/@-/package/.oxlintrc.json',
              '/@-/package/.gitattributes',
              '/@-/package/.gitignore',
              '/@-/package/.prettierrc',
              '/@-/package/README.md',
              '/@-/package/AGENTS.md',
              '/@-/package/jest.config.ts',
              '/@-/package/nest-cli.json',
              '/@-/package/package.json',
              '/@-/package/tsconfig.build.json',
              '/@-/package/tsconfig.json',
              '/@-/package/src/app.controller.spec.ts',
              '/@-/package/src/app.controller.ts',
              '/@-/package/src/app.module.ts',
              '/@-/package/src/app.service.ts',
              '/@-/package/src/main.ts',
              '/@-/package/test/app.e2e-spec.ts',
              '/@-/package/test/jest-e2e.json',
            ].sort(),
          );

          expect(
            JSON.parse(tree.readContent('/@-/package/package.json')),
          ).toMatchObject({
            name: '@-/package',
          });
        });
      });
    });
  });
  it('should manage name as number', async () => {
    const options: ApplicationOptions = {
      name: 123,
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/123/.oxlintrc.json',
        '/123/.gitattributes',
        '/123/.gitignore',
        '/123/.prettierrc',
        '/123/README.md',
        '/123/AGENTS.md',
        '/123/jest.config.ts',
        '/123/nest-cli.json',
        '/123/package.json',
        '/123/tsconfig.build.json',
        '/123/tsconfig.json',
        '/123/src/app.controller.spec.ts',
        '/123/src/app.controller.ts',
        '/123/src/app.module.ts',
        '/123/src/app.service.ts',
        '/123/src/main.ts',
        '/123/test/app.e2e-spec.ts',
        '/123/test/jest-e2e.json',
      ].sort(),
    );

    expect(JSON.parse(tree.readContent('/123/package.json'))).toMatchObject({
      name: '123',
    });
  });
  it('should manage javascript files', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/project/.gitattributes',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/babel.config.json',
        '/project/AGENTS.md',
        '/project/index.js',
        '/project/jest.config.js',
        '/project/jsconfig.json',
        '/project/nest-cli.json',
        '/project/nodemon.json',
        '/project/package.json',
        '/project/src/app.controller.js',
        '/project/src/app.controller.spec.js',
        '/project/src/app.module.js',
        '/project/src/app.service.js',
        '/project/src/main.js',
        '/project/test/app.e2e-spec.js',
        '/project/test/jest-e2e.json',
      ].sort(),
    );

    expect(JSON.parse(tree.readContent('/project/package.json'))).toMatchObject(
      {
        name: 'project',
      },
    );
  });
  it('should configure babel 8 for javascript files', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const { scripts, devDependencies } = JSON.parse(
      tree.readContent('/project/package.json'),
    );
    expect(devDependencies['@babel/core']).toMatch(/^\^?8\./);
    expect(devDependencies).not.toHaveProperty('@babel/node');
    expect(scripts.start).toEqual('node index.js');
    expect(JSON.parse(tree.readContent('/project/nodemon.json')).exec).toEqual(
      'node index.js',
    );

    const babelConfig = JSON.parse(
      tree.readContent('/project/babel.config.json'),
    );
    expect(babelConfig.plugins).toContainEqual([
      '@babel/plugin-proposal-decorators',
      { version: 'legacy' },
    ]);
    expect(tree.readContent('/project/jest.config.js')).toContain(
      "['babel-jest', { rootMode: 'upward' }]",
    );
    expect(
      JSON.parse(tree.readContent('/project/test/jest-e2e.json')).transform,
    ).toEqual({ '^.+\\.js$': ['babel-jest', { rootMode: 'upward' }] });
  });
  it('should manage destination directory', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      directory: 'app',
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/app/.oxlintrc.json',
        '/app/.gitattributes',
        '/app/.gitignore',
        '/app/.prettierrc',
        '/app/README.md',
        '/app/AGENTS.md',
        '/app/jest.config.ts',
        '/app/nest-cli.json',
        '/app/package.json',
        '/app/tsconfig.build.json',
        '/app/tsconfig.json',
        '/app/src/app.controller.spec.ts',
        '/app/src/app.controller.ts',
        '/app/src/app.module.ts',
        '/app/src/app.service.ts',
        '/app/src/main.ts',
        '/app/test/app.e2e-spec.ts',
        '/app/test/jest-e2e.json',
      ].sort(),
    );

    expect(JSON.parse(tree.readContent('/app/package.json'))).toMatchObject({
      name: 'project',
    });
  });
  it('should not create a spec file', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      spec: false,
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/project/.gitattributes',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/babel.config.json',
        '/project/AGENTS.md',
        '/project/index.js',
        '/project/jest.config.js',
        '/project/jsconfig.json',
        '/project/nest-cli.json',
        '/project/nodemon.json',
        '/project/package.json',
        '/project/src/app.controller.js',
        '/project/src/app.module.js',
        '/project/src/app.service.js',
        '/project/src/main.js',
        '/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should create a spec file', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      spec: true,
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/project/.gitattributes',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/babel.config.json',
        '/project/AGENTS.md',
        '/project/index.js',
        '/project/jest.config.js',
        '/project/jsconfig.json',
        '/project/nest-cli.json',
        '/project/nodemon.json',
        '/project/package.json',
        '/project/src/app.controller.js',
        '/project/src/app.controller.spec.js',
        '/project/src/app.module.js',
        '/project/src/app.service.js',
        '/project/src/main.js',
        '/project/test/app.e2e-spec.js',
        '/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should create a spec file with custom file suffix', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      spec: true,
      specFileSuffix: 'test',
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/project/.oxlintrc.json',
        '/project/.gitattributes',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/AGENTS.md',
        '/project/jest.config.ts',
        '/project/nest-cli.json',
        '/project/package.json',
        '/project/tsconfig.build.json',
        '/project/tsconfig.json',
        '/project/src/app.controller.test.ts',
        '/project/src/app.controller.ts',
        '/project/src/app.module.ts',
        '/project/src/app.service.ts',
        '/project/src/main.ts',
        '/project/test/app.e2e-test.ts',
        '/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should propagate a custom spec file suffix to the test runner configs', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      spec: true,
      specFileSuffix: 'test',
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    expect(tree.readContent('/project/jest.config.ts')).toContain(
      "testRegex: '.*\\\\.test\\\\.ts$'",
    );
    expect(
      JSON.parse(tree.readContent('/project/test/jest-e2e.json')).testRegex,
    ).toEqual('.e2e-test.ts$');
    expect(
      JSON.parse(tree.readContent('/project/tsconfig.build.json')).exclude,
    ).toContain('**/*test.ts');
  });
  it('should limit the build tsconfig to src so the entry point stays at dist/main', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    expect(
      JSON.parse(tree.readContent('/project/tsconfig.build.json')).include,
    ).toEqual(['src']);
  });
  it('should write an AGENTS.md holding only where production data goes, as link writes it', async () => {
    // The one thing an agent cannot learn from the repository itself. The
    // file is the section `npx @nestjs/observe link` writes, so a project
    // made here and a project linked later read the same.
    const onlyTheSection = (agents: string) => {
      expect(
        agents.startsWith(
          '# AGENTS.md\n\n## Production data: NestJS Observe\n',
        ),
      ).toBe(true);
      expect(agents.match(/^#+ /gm)).toHaveLength(2);
      expect(agents).toContain('https://observe-api.nestjs.com/mcp');
      expect(agents).not.toContain('<%');
    };

    const withObserve: UnitTestTree = await runner.runSchematic('application', {
      name: 'project',
      type: 'cjs',
      observe: true,
    } as ApplicationOptions);
    const agents = withObserve.readContent('/project/AGENTS.md');
    onlyTheSection(agents);
    expect(agents).toContain(
      'This app reports its traces, errors, logs and metrics to [NestJS Observe](https://observe.nestjs.com) through `ObserveModule` in `src/app.module.ts`.',
    );
    expect(agents).not.toContain('nothing is sent');

    // Answering no to Observe leaves it out of the app, not out of the notes:
    // they say where production data goes and the one command that links it,
    // in words that stay true once `link` has run - it leaves the section be.
    const withoutObserve: UnitTestTree = await runner.runSchematic(
      'application',
      { name: 'project', type: 'cjs' } as ApplicationOptions,
    );
    const plain = withoutObserve.readContent('/project/AGENTS.md');
    onlyTheSection(plain);
    expect(plain).toContain(
      'Until `ObserveModule` is registered in `src/app.module.ts`, nothing is sent: `npx @nestjs/observe link` sets it up in one step',
    );
    expect(plain).not.toContain('This app reports its traces');

    const esm: UnitTestTree = await runner.runSchematic('application', {
      name: 'project',
      type: 'esm',
    } as ApplicationOptions);
    onlyTheSection(esm.readContent('/project/AGENTS.md'));

    // JavaScript projects are linked but not wired by the CLI, so they are
    // pointed at the edits instead.
    const javascript: UnitTestTree = await runner.runSchematic('application', {
      name: 'project',
      language: 'js',
    } as ApplicationOptions);
    const js = javascript.readContent('/project/AGENTS.md');
    onlyTheSection(js);
    expect(js).toContain('registered in `src/app.module.js`, nothing is sent');
    expect(js).toContain(
      'https://observe.nestjs.com/documentation/sdk#quick-start',
    );
    expect(js).not.toContain('wires it into the app');
  });
  describe('when type is "esm"', () => {
    it('should generate ESM project files with vitest', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'esm',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/project/.oxlintrc.json',
          '/project/.gitattributes',
          '/project/.gitignore',
          '/project/.prettierrc',
          '/project/README.md',
          '/project/AGENTS.md',
          '/project/nest-cli.json',
          '/project/package.json',
          '/project/tsconfig.build.json',
          '/project/tsconfig.json',
          '/project/src/app.controller.spec.ts',
          '/project/src/app.controller.ts',
          '/project/src/app.module.ts',
          '/project/src/app.service.ts',
          '/project/src/main.ts',
          '/project/test/app.e2e-spec.ts',
          '/project/vitest.config.ts',
          '/project/vitest.config.e2e.ts',
        ].sort(),
      );
    });

    it('should generate ESM package.json with type module and vitest', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'esm',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const packageJson = JSON.parse(tree.readContent('/project/package.json'));
      expect(packageJson.type).toBe('module');
      expect(packageJson.devDependencies).toHaveProperty('vitest');
      expect(packageJson.devDependencies).not.toHaveProperty('unplugin-swc');
      // `test:cov` is unusable without an explicit coverage provider
      expect(packageJson.devDependencies).toHaveProperty('@vitest/coverage-v8');
      expect(packageJson.devDependencies).not.toHaveProperty('@swc/core');
      expect(packageJson.devDependencies).not.toHaveProperty('jest');
      expect(packageJson.devDependencies).not.toHaveProperty('ts-jest');
      expect(packageJson.devDependencies).not.toHaveProperty('@types/jest');
      expect(packageJson.devDependencies).not.toHaveProperty('ts-node');
      expect(packageJson.devDependencies).not.toHaveProperty('tsconfig-paths');
      expect(packageJson.devDependencies).toHaveProperty('oxlint');
      expect(packageJson.devDependencies).not.toHaveProperty('eslint');
      expect(packageJson.scripts.test).toBe('vitest run');
      expect(packageJson.scripts['test:e2e']).toBe(
        'vitest run --config ./vitest.config.e2e.ts',
      );
    });

    it('should generate ESM source files with .js import extensions', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'esm',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const mainContent = tree.readContent('/project/src/main.ts');
      expect(mainContent).toContain("from './app.module.js'");

      const moduleContent = tree.readContent('/project/src/app.module.ts');
      expect(moduleContent).toContain("from './app.controller.js'");
      expect(moduleContent).toContain("from './app.service.js'");

      const controllerContent = tree.readContent(
        '/project/src/app.controller.ts',
      );
      expect(controllerContent).toContain("from './app.service.js'");
    });

    it('should generate .oxlintrc.json config', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'esm',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const oxlintContent = tree.readContent('/project/.oxlintrc.json');
      const oxlintConfig = JSON.parse(oxlintContent);
      expect(oxlintConfig.rules).toBeDefined();
    });

    it('should generate CJS project files with jest', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const files: string[] = tree.files;
      expect(files).toContain('/project/test/jest-e2e.json');
      expect(files).toContain('/project/jest.config.ts');
      expect(files).not.toContain('/project/vitest.config.ts');

      const packageJson = JSON.parse(tree.readContent('/project/package.json'));
      expect(packageJson.type).toBeUndefined();
      expect(packageJson.devDependencies).toHaveProperty('jest');
      expect(packageJson.devDependencies).toHaveProperty('oxlint');
      expect(packageJson.devDependencies).not.toHaveProperty('eslint');
    });
  });
});
