import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ResolverOptions } from './resolver.schema';

describe('Resolver Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: ResolverOptions = {
      name: 'foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resolver', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should manage name as a path', async () => {
    const options: ResolverOptions = {
      name: 'bar/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resolver', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should manage name and path', async () => {
    const options: ResolverOptions = {
      name: 'foo',
      path: 'baz',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resolver', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/foo/foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/baz/foo/foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should manage name to normalize', async () => {
    const options: ResolverOptions = {
      name: 'fooBar',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resolver', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar/foo-bar.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo-bar/foo-bar.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooBarResolver {}\n',
    );
  });
  it('should manage path to normalize', async () => {
    const options: ResolverOptions = {
      name: 'barBaz/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resolver', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo/foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar-baz/foo/foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should keep underscores in path and file name', async () => {
    const options: ResolverOptions = {
      name: '_bar/_foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resolver', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_bar/_foo/_foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/_bar/_foo/_foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should manage javascript file', async () => {
    const options: ResolverOptions = {
      name: 'foo',
      language: 'js',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('resolver', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.resolver.js'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.resolver.js')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
});
