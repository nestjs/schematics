import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { parse } from './factory';
import { ContextApplicationOptions } from './options';

const SCHEMATICS_NAME: string = 'context-application';

describe('Context Application Factory', () => {
  describe('parse', () => {
    it('should not apply options transformations', () => {
      const options: ContextApplicationOptions = {
        name: 'name',
      };
      expect(parse(options)).toEqual({
        name: options.name,
      });
    });

    it('should dasherize the name option', () => {
      const options: ContextApplicationOptions = {
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
    it('should generate context application code boilerplate based on typescript', () => {
      const options: ContextApplicationOptions = {
        name: 'project',
      };
      const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/project/src/app.module.ts',
        '/project/src/main.ts',
        '/project/src/task.service.spec.ts',
        '/project/src/task.service.ts',
        '/project/test/app.e2e-spec.ts',
        '/project/test/jest-e2e.json',
      ]);
    });

    it('should generate context application code boilerplate based on javascript', () => {
      const options: ContextApplicationOptions = {
        name: 'project',
        language: 'js',
      };
      const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/project/src/app.module.js',
        '/project/src/main.js',
        '/project/src/task.service.js',
        '/project/src/task.service.spec.js',
        '/project/test/app.e2e-spec.js',
        '/project/test/jest-e2e.json',
      ]);
    });
  });
});
