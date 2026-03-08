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
          '/project/eslint.config.mjs',
          '/project/.gitignore',
          '/project/.prettierrc',
          '/project/README.md',
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
          `/project.foo.bar/eslint.config.mjs`,
          `/project.foo.bar/.gitignore`,
          `/project.foo.bar/.prettierrc`,
          `/project.foo.bar/README.md`,
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
          '/awesome-project/eslint.config.mjs',
          '/awesome-project/.gitignore',
          '/awesome-project/.prettierrc',
          '/awesome-project/README.md',
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
          '/_awesome-project/eslint.config.mjs',
          '/_awesome-project/.gitignore',
          '/_awesome-project/.prettierrc',
          '/_awesome-project/README.md',
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
          '/@/package/eslint.config.mjs',
          '/@/package/.gitignore',
          '/@/package/.prettierrc',
          '/@/package/README.md',
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
          '/eslint.config.mjs',
          '/.gitignore',
          '/.prettierrc',
          '/README.md',
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
              '/@scope/package/eslint.config.mjs',
              '/@scope/package/.gitignore',
              '/@scope/package/.prettierrc',
              '/@scope/package/README.md',
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
              '/@-/package/eslint.config.mjs',
              '/@-/package/.gitignore',
              '/@-/package/.prettierrc',
              '/@-/package/README.md',
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
        '/123/eslint.config.mjs',
        '/123/.gitignore',
        '/123/.prettierrc',
        '/123/README.md',
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
        '/project/.babelrc',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/index.js',
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
        '/app/eslint.config.mjs',
        '/app/.gitignore',
        '/app/.prettierrc',
        '/app/README.md',
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
        '/project/.babelrc',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/index.js',
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
        '/project/.babelrc',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/index.js',
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
        '/project/eslint.config.mjs',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
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
          '/project/eslint.config.mjs',
          '/project/.gitignore',
          '/project/.prettierrc',
          '/project/README.md',
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
      expect(packageJson.devDependencies).not.toHaveProperty('@swc/core');
      expect(packageJson.devDependencies).not.toHaveProperty('jest');
      expect(packageJson.devDependencies).not.toHaveProperty('ts-jest');
      expect(packageJson.devDependencies).not.toHaveProperty('@types/jest');
      expect(packageJson.devDependencies).not.toHaveProperty('ts-node');
      expect(packageJson.devDependencies).not.toHaveProperty('tsconfig-paths');
      expect(packageJson.devDependencies).not.toHaveProperty(
        '@eslint/eslintrc',
      );
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

    it('should generate ESM eslint config with sourceType module', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'esm',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const eslintContent = tree.readContent('/project/eslint.config.mjs');
      expect(eslintContent).toContain("sourceType: 'module'");
      expect(eslintContent).not.toContain('globals.jest');
      expect(eslintContent).not.toContain('tseslint.config(');
      expect(eslintContent).toContain('export default [');
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
      expect(files).not.toContain('/project/vitest.config.ts');

      const packageJson = JSON.parse(tree.readContent('/project/package.json'));
      expect(packageJson.type).toBeUndefined();
      expect(packageJson.devDependencies).toHaveProperty('jest');
      expect(packageJson.devDependencies).not.toHaveProperty(
        '@eslint/eslintrc',
      );
    });
  });
});
