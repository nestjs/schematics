import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { PipeOptions } from './pipe.schema';

describe('Pipe Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: PipeOptions = {
      name: 'foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('pipe', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.pipe.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.pipe.ts')).toEqual(
      "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooPipe implements PipeTransform {\n' +
        '  transform(value: any, metadata: ArgumentMetadata) {\n' +
        '    return value;\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage name as a path', async () => {
    const options: PipeOptions = {
      name: 'bar/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('pipe', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.pipe.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.pipe.ts')).toEqual(
      "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooPipe implements PipeTransform {\n' +
        '  transform(value: any, metadata: ArgumentMetadata) {\n' +
        '    return value;\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage name and path', async () => {
    const options: PipeOptions = {
      name: 'foo',
      path: 'baz',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('pipe', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/foo/foo.pipe.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/baz/foo/foo.pipe.ts')).toEqual(
      "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooPipe implements PipeTransform {\n' +
        '  transform(value: any, metadata: ArgumentMetadata) {\n' +
        '    return value;\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage name to normalize', async () => {
    const options: PipeOptions = {
      name: 'fooBar',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('pipe', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar/foo-bar.pipe.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo-bar/foo-bar.pipe.ts')).toEqual(
      "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooBarPipe implements PipeTransform {\n' +
        '  transform(value: any, metadata: ArgumentMetadata) {\n' +
        '    return value;\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage path to normalize', async () => {
    const options: PipeOptions = {
      name: 'barBaz/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('pipe', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo/foo.pipe.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar-baz/foo/foo.pipe.ts')).toEqual(
      "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooPipe implements PipeTransform {\n' +
        '  transform(value: any, metadata: ArgumentMetadata) {\n' +
        '    return value;\n' +
        '  }\n' +
        '}\n',
    );
  });

  it("should manage to keep underscores on pipe's path and name", async () => {
    const options: PipeOptions = {
      name: '_bar/_foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('pipe', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_bar/_foo/_foo.pipe.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/_bar/_foo/_foo.pipe.ts')).toEqual(
      "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooPipe implements PipeTransform {\n' +
        '  transform(value: any, metadata: ArgumentMetadata) {\n' +
        '    return value;\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage javascript file', async () => {
    const options: PipeOptions = {
      name: 'foo',
      language: 'js',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('pipe', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.pipe.js'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.pipe.js')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooPipe {\n' +
        '  transform(value, metadata) {\n' +
        '    return value;\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should create a spec file', async () => {
    const options: PipeOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('pipe', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.pipe.spec.ts'),
    ).not.toBeUndefined();
  });
  it('should create a spec file with custom file suffix', async () => {
    const options: PipeOptions = {
      name: 'foo',
      spec: true,
      specFileSuffix: 'test',
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('pipe', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.pipe.spec.ts'),
    ).toBeUndefined();
    expect(
      files.find((filename) => filename === '/foo.pipe.test.ts'),
    ).toBeDefined();
  });
});
