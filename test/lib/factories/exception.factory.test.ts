import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ExceptionOptions } from '../../../src/lib/factories/exception.schema';

describe('Exception Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: ExceptionOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.exception.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.exception.ts')).toEqual(
      'import { HttpException, HttpStatus } from \'@nestjs/common\';\n' +
      '\n' +
      'export class FooException extends HttpException {\n' +
      '  constructor() {\n' +
      '    super(\'Foo\', HttpStatus.NOT_FOUND);\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name as a path', () => {
    const options: ExceptionOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.exception.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo/foo.exception.ts')).toEqual(
      'import { HttpException, HttpStatus } from \'@nestjs/common\';\n' +
      '\n' +
      'export class FooException extends HttpException {\n' +
      '  constructor() {\n' +
      '    super(\'Foo\', HttpStatus.NOT_FOUND);\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name and path', () => {
    const options: ExceptionOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/baz/foo/foo.exception.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/baz/foo/foo.exception.ts')).toEqual(
      'import { HttpException, HttpStatus } from \'@nestjs/common\';\n' +
      '\n' +
      'export class FooException extends HttpException {\n' +
      '  constructor() {\n' +
      '    super(\'Foo\', HttpStatus.NOT_FOUND);\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: ExceptionOptions = {
      name: 'fooBar'
    };
    const tree: UnitTestTree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo-bar/foo-bar.exception.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo-bar/foo-bar.exception.ts')).toEqual(
      'import { HttpException, HttpStatus } from \'@nestjs/common\';\n' +
      '\n' +
      'export class FooBarException extends HttpException {\n' +
      '  constructor() {\n' +
      '    super(\'FooBar\', HttpStatus.NOT_FOUND);\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage path to dasherize', () => {
    const options: ExceptionOptions = {
      name: 'barBaz/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-baz/foo/foo.exception.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar-baz/foo/foo.exception.ts')).toEqual(
      'import { HttpException, HttpStatus } from \'@nestjs/common\';\n' +
      '\n' +
      'export class FooException extends HttpException {\n' +
      '  constructor() {\n' +
      '    super(\'Foo\', HttpStatus.NOT_FOUND);\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage javascript file', () => {
    const options: ExceptionOptions = {
      name: 'foo',
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.exception.js')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.exception.js')).toEqual(
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
