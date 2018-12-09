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
  it('should manage name only', () => {
    const options: PipeOptions = {
      name: 'foo',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo/foo.pipe.ts'),
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
  it('should manage name as a path', () => {
    const options: PipeOptions = {
      name: 'bar/foo',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar/foo/foo.pipe.ts'),
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
  it('should manage name and path', () => {
    const options: PipeOptions = {
      name: 'foo',
      path: 'baz',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/baz/foo/foo.pipe.ts'),
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
  it('should manage name to dasherize', () => {
    const options: PipeOptions = {
      name: 'fooBar',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo-bar/foo-bar.pipe.ts'),
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
  it('should manage path to dasherize', () => {
    const options: PipeOptions = {
      name: 'barBaz/foo',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar-baz/foo/foo.pipe.ts'),
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
  it('should manage javascript file', () => {
    const options: PipeOptions = {
      name: 'foo',
      language: 'js',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo/foo.pipe.js'),
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
});
