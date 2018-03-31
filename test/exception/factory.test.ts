import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { ExceptionOptions } from '../../src/exception/schema';

describe('Exception Factory', () => {
  describe('Schematic definition', () => {
    context('Manage name only', () => {
      it('should generate a new exception file', () => {
        const options: ExceptionOptions = {
          name: 'foo'
        };
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        const tree: UnitTestTree = runner.runSchematic('exception', options, root);
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/foo/foo.exception.ts'))
          .to.not.be.undefined;
      });
    });
    context('Manage name as a path', () => {
      const options: ExceptionOptions = {
        name: 'bar/foo'
      };
      const runner: SchematicTestRunner = new SchematicTestRunner(
        '.',
        path.join(process.cwd(), 'src/collection.json')
      );
      const appOptions: ApplicationOptions = {
        directory: '',
      };
      const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
      const tree: UnitTestTree = runner.runSchematic('exception', options, root);
      const files: string[] = tree.files;
      expect(files.find((filename) => filename === '/src/bar/foo/foo.exception.ts'))
        .to.not.be.undefined;
    });
    context('Manage name and path', () => {
      const options: ExceptionOptions = {
        name: 'foo',
        path: 'bar'
      };
      const runner: SchematicTestRunner = new SchematicTestRunner(
        '.',
        path.join(process.cwd(), 'src/collection.json')
      );
      const appOptions: ApplicationOptions = {
        directory: '',
      };
      const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
      const tree: UnitTestTree = runner.runSchematic('exception', options, root);
      const files: string[] = tree.files;
      expect(files.find((filename) => filename === '/src/bar/foo/foo.exception.ts'))
        .to.not.be.undefined;
    });
  });
});
