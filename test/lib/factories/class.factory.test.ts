import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ClassOptions } from '../../../src/lib/factories/class.schema';

describe('Class Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: ClassOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('class', options);
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.ts')).toEqual(
      'export class Foo {}\n'
    );
  });
  it('should manage name as a path', () => {
    const options: ClassOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('class', options);
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo/foo.ts')).toEqual(
      'export class Foo {}\n'
    );
  });
  it('should manage name and path', () => {
    const options: ClassOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('class', options);
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/baz/foo/foo.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/baz/foo/foo.ts')).toEqual(
      'export class Foo {}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: ClassOptions = {
      name: 'fooBar'
    };
    const tree: UnitTestTree = runner.runSchematic('class', options);
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo-bar/foo-bar.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo-bar/foo-bar.ts')).toEqual(
      'export class FooBar {}\n'
    );
  });
  it('should manage path to dasherize', () => {
    const options: ClassOptions = {
      name: 'barBaz/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('class', options);
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-baz/foo/foo.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar-baz/foo/foo.ts')).toEqual(
      'export class Foo {}\n'
    );
  });
  it('should manage javascript file', () => {
    const options: ClassOptions = {
      name: 'foo',
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('class', options);
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.js')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.js')).toEqual(
      'export class Foo {}\n'
    );
  });
});
