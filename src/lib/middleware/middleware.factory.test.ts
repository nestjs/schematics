import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { MiddlewareOptions } from './middleware.schema';

describe('Middleware Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', () => {
    const options: MiddlewareOptions = {
      name: 'foo',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo/foo.middleware.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.middleware.ts')).toEqual(
      "import { Injectable, NestMiddleware } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooMiddleware implements NestMiddleware {\n' +
        '  use(req: any, res: any, next: () => void) {\n' +
        '    next();\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage name as a path', () => {
    const options: MiddlewareOptions = {
      name: 'bar/foo',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar/foo/foo.middleware.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.middleware.ts')).toEqual(
      "import { Injectable, NestMiddleware } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooMiddleware implements NestMiddleware {\n' +
        '  use(req: any, res: any, next: () => void) {\n' +
        '    next();\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage name and path', () => {
    const options: MiddlewareOptions = {
      name: 'foo',
      path: 'baz',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/baz/foo/foo.middleware.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/baz/foo/foo.middleware.ts')).toEqual(
      "import { Injectable, NestMiddleware } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooMiddleware implements NestMiddleware {\n' +
        '  use(req: any, res: any, next: () => void) {\n' +
        '    next();\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage name to dasherize', () => {
    const options: MiddlewareOptions = {
      name: 'fooBar',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo-bar/foo-bar.middleware.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo-bar/foo-bar.middleware.ts')).toEqual(
      "import { Injectable, NestMiddleware } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooBarMiddleware implements NestMiddleware {\n' +
        '  use(req: any, res: any, next: () => void) {\n' +
        '    next();\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage path to dasherize', () => {
    const options: MiddlewareOptions = {
      name: 'barBaz/foo',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar-baz/foo/foo.middleware.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar-baz/foo/foo.middleware.ts')).toEqual(
      "import { Injectable, NestMiddleware } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooMiddleware implements NestMiddleware {\n' +
        '  use(req: any, res: any, next: () => void) {\n' +
        '    next();\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage javascript file', () => {
    const options: MiddlewareOptions = {
      name: 'foo',
      language: 'js',
      flat: false,
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo/foo.middleware.js'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.middleware.js')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooMiddleware {\n' +
        '  use(req, res, next) {\n' +
        '    next();\n' +
        '  }\n' +
        '}\n',
    );
  });
});
