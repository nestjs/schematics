import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { ExceptionOptions } from '../../src/exception/schema';

describe('Exception Factory', () => {
  describe('Schematic definition', () => {
    context('Manage name only', () => {
      const options: ExceptionOptions = {
        name: 'foo'
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('exception', options, root);
      });
      it('should generate a new exception file', () => {
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/foo/foo.exception.ts'))
          .to.not.be.undefined;
      });
      it('should generate the expected exception file content', () => {
        expect(tree.readContent('/src/foo/foo.exception.ts'))
          .to.be.equal(
          'import { HttpException, HttpStatus } from \'@nestjs/common\';\n' +
          '\n' +
          'export class FooException extends HttpException {\n' +
          '  constructor() {\n' +
          '    super(\'Foo\', HttpStatus.NOT_FOUND);\n' +
          '  }\n' +
          '}\n'
        );
      });
    });
    context('Manage name as a path', () => {
      const options: ExceptionOptions = {
        name: 'bar/foo'
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('exception', options, root);
      });
      it('should generate a new exception file', () => {
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/bar/foo/foo.exception.ts'))
          .to.not.be.undefined;
      });
      it('should generate the expected exception file content', () => {
        expect(tree.readContent('/src/bar/foo/foo.exception.ts'))
          .to.be.equal(
          'import { HttpException, HttpStatus } from \'@nestjs/common\';\n' +
          '\n' +
          'export class FooException extends HttpException {\n' +
          '  constructor() {\n' +
          '    super(\'Foo\', HttpStatus.NOT_FOUND);\n' +
          '  }\n' +
          '}\n'
        );
      });
    });
    context('Manage name and path', () => {
      const options: ExceptionOptions = {
        name: 'foo',
        path: 'bar'
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('exception', options, root);
      });
      it('should generate a new exception file', () => {
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/bar/foo/foo.exception.ts'))
          .to.not.be.undefined;
      });
      it('should generate the expected exception file content', () => {
        expect(tree.readContent('/src/bar/foo/foo.exception.ts'))
          .to.be.equal(
          'import { HttpException, HttpStatus } from \'@nestjs/common\';\n' +
          '\n' +
          'export class FooException extends HttpException {\n' +
          '  constructor() {\n' +
          '    super(\'Foo\', HttpStatus.NOT_FOUND);\n' +
          '  }\n' +
          '}\n'
        );
      });
    });
  });
});
