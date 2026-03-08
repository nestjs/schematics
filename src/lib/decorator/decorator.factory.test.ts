import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { DecoratorOptions } from './decorator.schema.js';

describe('Decorator Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: DecoratorOptions = {
      name: 'foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('decorator', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.decorator.ts')).toEqual(
      "import { Reflector } from '@nestjs/core';\n" +
        '\n' +
        'export const Foo = Reflector.createDecorator<string[]>();\n',
    );
  });
  it('should manage name as a path', async () => {
    const options: DecoratorOptions = {
      name: 'bar/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('decorator', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.decorator.ts')).toEqual(
      "import { Reflector } from '@nestjs/core';\n" +
        '\n' +
        'export const Foo = Reflector.createDecorator<string[]>();\n',
    );
  });
  it('should manage name and path', async () => {
    const options: DecoratorOptions = {
      name: 'foo',
      path: 'baz',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('decorator', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/foo/foo.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/baz/foo/foo.decorator.ts')).toEqual(
      "import { Reflector } from '@nestjs/core';\n" +
        '\n' +
        'export const Foo = Reflector.createDecorator<string[]>();\n',
    );
  });
  it('should manage name to normalize', async () => {
    const options: DecoratorOptions = {
      name: 'fooBar',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('decorator', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar/foo-bar.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo-bar/foo-bar.decorator.ts')).toEqual(
      "import { Reflector } from '@nestjs/core';\n" +
        '\n' +
        'export const FooBar = Reflector.createDecorator<string[]>();\n',
    );
  });
  it('should manage path to normalize', async () => {
    const options: DecoratorOptions = {
      name: 'barBaz/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('decorator', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo/foo.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar-baz/foo/foo.decorator.ts')).toEqual(
      "import { Reflector } from '@nestjs/core';\n" +
        '\n' +
        'export const Foo = Reflector.createDecorator<string[]>();\n',
    );
  });
  it("should keep underscores on application's name", async () => {
    const options: DecoratorOptions = {
      name: '_bar/_foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('decorator', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_bar/_foo/_foo.decorator.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/_bar/_foo/_foo.decorator.ts')).toEqual(
      "import { Reflector } from '@nestjs/core';\n" +
        '\n' +
        'export const Foo = Reflector.createDecorator<string[]>();\n',
    );
  });
  it('should manage javascript file', async () => {
    const options: DecoratorOptions = {
      name: 'foo',
      language: 'js',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('decorator', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.decorator.js'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.decorator.js')).toEqual(
      "import { Reflector } from '@nestjs/core';\n" +
        '\n' +
        'export const Foo = Reflector.createDecorator();\n',
    );
  });
});
