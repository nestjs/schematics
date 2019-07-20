import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { parse } from './factory';
import { WebApplicationOptions } from './options';

const SCHEMATICS_NAME: string = 'web-application';

describe('Web Application Factory', () => {
  describe('parse', () => {
    it('should not apply options transformations', () => {
      const options: WebApplicationOptions = {
        name: 'name',
      };
      expect(parse(options)).toEqual({
        name: options.name,
      });
    });

    it('should dasherize the name option', () => {
      const options: WebApplicationOptions = {
        name: 'camelCaseName',
      };
      expect(parse(options)).toEqual({
        name: 'camel-case-name',
      });
    });
  });

  describe('main', () => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json'),
    );
    it('should generate web application code boilerplate based on typescript', () => {
      const options: WebApplicationOptions = {
        name: 'project',
      };
      const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/project/src/app.controller.spec.ts',
        '/project/src/app.controller.ts',
        '/project/src/app.module.ts',
        '/project/src/app.service.ts',
        '/project/src/main.ts',
        '/project/test/app.e2e-spec.ts',
        '/project/test/jest-e2e.json',
      ]);
    });

    it('should generate web application code boilerplate based on javascript', () => {
      const options: WebApplicationOptions = {
        name: 'project',
        language: 'js',
      };
      const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
      const files: string[] = tree.files;
      expect(files).toEqual([
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
