import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { PipeOptions } from '../../src/pipe/schema';

describe('Pipe Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: PipeOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.pipe.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.pipe.ts')).toEqual(
      'import { PipeTransform, Pipe, ArgumentMetadata } from \'@nestjs/common\';\n' +
      '\n' +
      '@Pipe()\n' +
      'export class FooPipe implements PipeTransform<any> {\n' +
      '  async transform(value: any, metadata: ArgumentMetadata) {\n' +
      '    return value;\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name as a path', () => {
    const options: PipeOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.pipe.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo/foo.pipe.ts')).toEqual(
      'import { PipeTransform, Pipe, ArgumentMetadata } from \'@nestjs/common\';\n' +
      '\n' +
      '@Pipe()\n' +
      'export class FooPipe implements PipeTransform<any> {\n' +
      '  async transform(value: any, metadata: ArgumentMetadata) {\n' +
      '    return value;\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name and path', () => {
    const options: PipeOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/baz/foo/foo.pipe.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/baz/foo/foo.pipe.ts')).toEqual(
      'import { PipeTransform, Pipe, ArgumentMetadata } from \'@nestjs/common\';\n' +
      '\n' +
      '@Pipe()\n' +
      'export class FooPipe implements PipeTransform<any> {\n' +
      '  async transform(value: any, metadata: ArgumentMetadata) {\n' +
      '    return value;\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: PipeOptions = {
      name: 'fooBar'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo-bar/foo-bar.pipe.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo-bar/foo-bar.pipe.ts')).toEqual(
      'import { PipeTransform, Pipe, ArgumentMetadata } from \'@nestjs/common\';\n' +
      '\n' +
      '@Pipe()\n' +
      'export class FooBarPipe implements PipeTransform<any> {\n' +
      '  async transform(value: any, metadata: ArgumentMetadata) {\n' +
      '    return value;\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage path to dasherize', () => {
    const options: PipeOptions = {
      name: 'barBaz/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-baz/foo/foo.pipe.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar-baz/foo/foo.pipe.ts')).toEqual(
      'import { PipeTransform, Pipe, ArgumentMetadata } from \'@nestjs/common\';\n' +
      '\n' +
      '@Pipe()\n' +
      'export class FooPipe implements PipeTransform<any> {\n' +
      '  async transform(value: any, metadata: ArgumentMetadata) {\n' +
      '    return value;\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage javascript file', () => {
    const options: PipeOptions = {
      name: 'foo',
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.pipe.js')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.pipe.js')).toEqual(
      'import { Pipe } from \'@nestjs/common\';\n' +
      '\n' +
      '@Pipe()\n' +
      'export class FooPipe {\n' +
      '  async transform(value, metadata) {\n' +
      '    return value;\n' +
      '  }\n' +
      '}\n'
    );
  });
});
