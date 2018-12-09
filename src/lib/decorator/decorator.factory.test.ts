import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { DecoratorOptions } from './decorator.schema';

describe('Decorator Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', () => {
    const options: DecoratorOptions = {
      name: 'foo',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('decorator', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo/foo.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.decorator.ts')).toEqual(
      "import { ReflectMetadata } from '@nestjs/common';\n" +
        '\n' +
        "export const Foo = (...args: string[]) => ReflectMetadata('foo', args);\n",
    );
  });
  it('should manage name as a path', () => {
    const options: DecoratorOptions = {
      name: 'bar/foo',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('decorator', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar/foo/foo.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.decorator.ts')).toEqual(
      "import { ReflectMetadata } from '@nestjs/common';\n" +
        '\n' +
        "export const Foo = (...args: string[]) => ReflectMetadata('foo', args);\n",
    );
  });
  it('should manage name and path', () => {
    const options: DecoratorOptions = {
      name: 'foo',
      path: 'baz',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('decorator', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/baz/foo/foo.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/baz/foo/foo.decorator.ts')).toEqual(
      "import { ReflectMetadata } from '@nestjs/common';\n" +
        '\n' +
        "export const Foo = (...args: string[]) => ReflectMetadata('foo', args);\n",
    );
  });
  it('should manage name to dasherize', () => {
    const options: DecoratorOptions = {
      name: 'fooBar',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('decorator', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo-bar/foo-bar.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo-bar/foo-bar.decorator.ts')).toEqual(
      "import { ReflectMetadata } from '@nestjs/common';\n" +
        '\n' +
        "export const FooBar = (...args: string[]) => ReflectMetadata('foo-bar', args);\n",
    );
  });
  it('should manage path to dasherize', () => {
    const options: DecoratorOptions = {
      name: 'barBaz/foo',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('decorator', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar-baz/foo/foo.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar-baz/foo/foo.decorator.ts')).toEqual(
      "import { ReflectMetadata } from '@nestjs/common';\n" +
        '\n' +
        "export const Foo = (...args: string[]) => ReflectMetadata('foo', args);\n",
    );
  });
  it('should manage javascript file', () => {
    const options: DecoratorOptions = {
      name: 'foo',
      language: 'js',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('decorator', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo/foo.decorator.js'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.decorator.js')).toEqual(
      "import { ReflectMetadata } from '@nestjs/common';\n" +
        '\n' +
        "export const Foo = (...args) => ReflectMetadata('foo', args);\n",
    );
  });
});
