import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { parse } from './factory';
import { MicroserviceApplicationOptions } from './options';

const SCHEMATICS_NAME: string = 'microservice-application';

describe('Microservice Application Factory', () => {
  describe('parse', () => {
    it('should not apply options transformations', () => {
      const options: MicroserviceApplicationOptions = {
        name: 'name',
      };
      expect(parse(options)).toEqual({
        name: options.name,
      });
    });

    it('should dasherize the name option', () => {
      const options: MicroserviceApplicationOptions = {
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
    it('should generate microservice application code boilerplate based on typescript', () => {
      const options: MicroserviceApplicationOptions = {
        name: 'project',
      };
      const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/project/src/app.module.ts',
        '/project/src/main.ts',
        '/project/src/math.controller.spec.ts',
        '/project/src/math.controller.ts',
        '/project/test/app.e2e-spec.ts',
        '/project/test/jest-e2e.json',
      ]);
    });

    it('should generate microservice application code boilerplate based on javascript', () => {
      const options: MicroserviceApplicationOptions = {
        name: 'project',
        language: 'js',
      };
      const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/project/src/app.module.js',
        '/project/src/main.js',
        '/project/src/math.controller.js',
        '/project/src/math.controller.spec.js',
        '/project/test/app.e2e-spec.js',
        '/project/test/jest-e2e.json',
      ]);
    });
  });
});
