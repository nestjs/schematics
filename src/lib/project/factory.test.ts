import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { parse } from './factory';
import { ProjectOptions } from './options';

const SCHEMATICS_NAME: string = 'project';

describe('Project Factory', () => {
  describe('parse', () => {
    it('should not apply options transformations', () => {
      const options: ProjectOptions = {
        name: 'name',
      };
      expect(parse(options)).toEqual({
        name: options.name,
      });
    });

    it('should dasherize the name option', () => {
      const options: ProjectOptions = {
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
      join(process.cwd(), 'src/collection.json'),
    );
    it('should generate a project based one typescript', () => {
      const options: ProjectOptions = {
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
      ]);
    });

    it('should generate a project based one javascript', () => {
      const options: ProjectOptions = {
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
      ]);
    });
  });
});
