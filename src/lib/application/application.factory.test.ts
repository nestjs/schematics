import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ApplicationOptions } from './application.schema';

describe('Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  describe('when only the name is supplied', () => {
    it('should manage basic (ie., cross-platform) name', async () => {
      const options: ApplicationOptions = {
        name: 'project',
      };
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise();
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/project/.eslintrc.js',
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
      ]);

      expect(
        JSON.parse(tree.readContent('/project/package.json')),
      ).toMatchObject({
        name: 'project',
      });
    });
    it('should manage name with dots in it', async () => {
      const options: ApplicationOptions = {
        name: 'project.foo.bar',
      };
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise();
      const files: string[] = tree.files;
      expect(files).toEqual([
        `/project.foo.bar/.eslintrc.js`,
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
      ]);

      expect(
        JSON.parse(tree.readContent('/project.foo.bar/package.json')),
      ).toMatchObject({
        name: 'project.foo.bar',
      });
    });
    it('should manage name to normalize from camel case name', async () => {
      const options: ApplicationOptions = {
        name: 'awesomeProject',
      };
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise();
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/awesome-project/.eslintrc.js',
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
      ]);

      expect(
        JSON.parse(tree.readContent('/awesome-project/package.json')),
      ).toMatchObject({
        name: 'awesome-project',
      });
    });
    it('should keep underscores', async () => {
      const options: ApplicationOptions = {
        name: '_awesomeProject',
      };
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise();
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/_awesome-project/.eslintrc.js',
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
      ]);

      expect(
        JSON.parse(tree.readContent('/_awesome-project/package.json')),
      ).toMatchObject({
        name: '_awesome-project',
      });
    });
    it('should manage basic name that has no scope name in it but starts with "@"', async () => {
      const options: ApplicationOptions = {
        name: '@/package',
      };
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise();
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/@/package/.eslintrc.js',
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
      ]);

      expect(
        JSON.parse(tree.readContent('/@/package/package.json')),
      ).toMatchObject({
        name: 'package',
      });
    });
    it('should manage the name "." (ie., current working directory)', async () => {
      const options: ApplicationOptions = {
        name: '.',
      };
      const tree: UnitTestTree = await runner
        .runSchematicAsync('application', options)
        .toPromise();
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/.eslintrc.js',
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
      ]);

      expect(JSON.parse(tree.readContent('/package.json'))).toMatchObject({
        name: path.basename(process.cwd()),
      });
    });
    describe('and it meant to be a scoped package', () => {
      describe('that leads to a valid scope name', () => {
        it('should manage basic name', async () => {
          const options: ApplicationOptions = {
            name: '@scope/package',
          };
          const tree: UnitTestTree = await runner
            .runSchematicAsync('application', options)
            .toPromise();
          const files: string[] = tree.files;
          expect(files).toEqual([
            '/@scope/package/.eslintrc.js',
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
          ]);

          expect(
            JSON.parse(tree.readContent('/@scope/package/package.json')),
          ).toMatchObject({
            name: '@scope/package',
          });
        });
        it('should manage name with blank space right after the "@" symbol', async () => {
          const options: ApplicationOptions = {
            name: '@ /package',
          };
          const tree: UnitTestTree = await runner
            .runSchematicAsync('application', options)
            .toPromise();
          const files: string[] = tree.files;
          expect(files).toEqual([
            '/@-/package/.eslintrc.js',
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
          ]);

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
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/123/.eslintrc.js',
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
    ]);

    expect(JSON.parse(tree.readContent('/123/package.json'))).toMatchObject({
      name: '123',
    });
  });
  it('should manage javascript files', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
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
    ]);

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
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/app/.eslintrc.js',
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
    ]);

    expect(JSON.parse(tree.readContent('/app/package.json'))).toMatchObject({
      name: 'project',
    });
  });
});
