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
      const tree: UnitTestTree = await runner.runSchematicAsync('application', options).toPromise();
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

      expect(JSON.parse(tree.readContent('/project/package.json'))).toMatchObject({
        name: 'project',
      });
    });
    it('should manage name with dots in it', async () => {
      const options: ApplicationOptions = {
        name: 'project.foo.bar',
      };
      const tree: UnitTestTree = await runner.runSchematicAsync('application', options).toPromise();
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

      expect(JSON.parse(tree.readContent('/project.foo.bar/package.json'))).toMatchObject({
        name: 'project.foo.bar',
      });
    });
    it('should manage name to dasherize', async () => {
      const options: ApplicationOptions = {
        name: 'awesomeProject',
      };
      const tree: UnitTestTree = await runner.runSchematicAsync('application', options).toPromise();
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

      expect(JSON.parse(tree.readContent('/awesome-project/package.json'))).toMatchObject({
        name: 'awesome-project',
      });
    });
  });
  it('should manage javascript files', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('application', options).toPromise();
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

    expect(JSON.parse(tree.readContent('/project/package.json'))).toMatchObject({
      name: 'project',
    });
  });
  it('should manage destination directory', async () => {
    const options: ApplicationOptions = {
      name: '@scope/package',
      directory: 'scope-package',
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('application', options).toPromise();
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/scope-package/.eslintrc.js',
      '/scope-package/.gitignore',
      '/scope-package/.prettierrc',
      '/scope-package/README.md',
      '/scope-package/nest-cli.json',
      '/scope-package/package.json',
      '/scope-package/tsconfig.build.json',
      '/scope-package/tsconfig.json',
      '/scope-package/src/app.controller.spec.ts',
      '/scope-package/src/app.controller.ts',
      '/scope-package/src/app.module.ts',
      '/scope-package/src/app.service.ts',
      '/scope-package/src/main.ts',
      '/scope-package/test/app.e2e-spec.ts',
      '/scope-package/test/jest-e2e.json',
    ]);

    expect(JSON.parse(tree.readContent('/scope-package/package.json'))).toMatchObject({
      name: 'package',
    });
  });
});
