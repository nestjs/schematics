import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { DefaultOption } from './constantes';
import { parse } from './factory';
import { ApplicationWebOptions } from './options';

const SCHEMATICS_NAME: string = 'application-web';

describe('Application Web Factory', () => {
  describe('parse', () => {
    it('should set default options', () => {
      const options: ApplicationWebOptions = {
        name: 'name',
      };
      expect(parse(options)).toEqual({
        author: DefaultOption.AUTHOR,
        description: DefaultOption.DESCRIPTION,
        language: DefaultOption.LANGUAGE,
        name: options.name,
        version: DefaultOption.VERSION,
        packageManager: DefaultOption.PACKAGE_MANAGER,
        dependencies: '',
        devDependencies: '',
      });
    });

    it('should dasherize the name', () => {
      const options: ApplicationWebOptions = {
        name: 'camelCaseName',
      };
      expect(parse(options)).toEqual({
        author: DefaultOption.AUTHOR,
        description: DefaultOption.DESCRIPTION,
        language: DefaultOption.LANGUAGE,
        name: 'camel-case-name',
        version: DefaultOption.VERSION,
        packageManager: DefaultOption.PACKAGE_MANAGER,
        dependencies: '',
        devDependencies: '',
      });
    });
  });

  describe('main', () => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json'),
    );
    it('should manage typescript files', () => {
      const options: ApplicationWebOptions = {
        name: 'project',
      };
      const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/nest-cli.json',
        '/project/nodemon-debug.json',
        '/project/nodemon.json',
        '/project/package.json',
        '/project/tsconfig.build.json',
        '/project/tsconfig.json',
        '/project/tslint.json',
        '/project/src/app.controller.spec.ts',
        '/project/src/app.controller.ts',
        '/project/src/app.module.ts',
        '/project/src/app.service.ts',
        '/project/src/main.ts',
        '/project/test/app.e2e-spec.ts',
        '/project/test/jest-e2e.json',
      ]);
    });

    it('should manage javascript files', () => {
      const options: ApplicationWebOptions = {
        name: 'project',
        language: 'js',
      };
      const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
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
    });
  });
});
