import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { MiddlewareOptions } from '../../../src/lib/factories/middleware.schema';

describe('Middleware Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: MiddlewareOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.middleware.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.middleware.ts')).toEqual(
      'import { Injectable, MiddlewareFunction, NestMiddleware } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooMiddleware implements NestMiddleware {\n' +
      '  resolve(...args: any[]): MiddlewareFunction {\n' +
      '    return (req, res, next) => {\n' +
      '      next();\n' +
      '    };\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name as a path', () => {
    const options: MiddlewareOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.middleware.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo/foo.middleware.ts')).toEqual(
      'import { Injectable, MiddlewareFunction, NestMiddleware } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooMiddleware implements NestMiddleware {\n' +
      '  resolve(...args: any[]): MiddlewareFunction {\n' +
      '    return (req, res, next) => {\n' +
      '      next();\n' +
      '    };\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name and path', () => {
    const options: MiddlewareOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/baz/foo/foo.middleware.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/baz/foo/foo.middleware.ts')).toEqual(
      'import { Injectable, MiddlewareFunction, NestMiddleware } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooMiddleware implements NestMiddleware {\n' +
      '  resolve(...args: any[]): MiddlewareFunction {\n' +
      '    return (req, res, next) => {\n' +
      '      next();\n' +
      '    };\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: MiddlewareOptions = {
      name: 'fooBar'
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo-bar/foo-bar.middleware.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo-bar/foo-bar.middleware.ts')).toEqual(
      'import { Injectable, MiddlewareFunction, NestMiddleware } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooBarMiddleware implements NestMiddleware {\n' +
      '  resolve(...args: any[]): MiddlewareFunction {\n' +
      '    return (req, res, next) => {\n' +
      '      next();\n' +
      '    };\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage path to dasherize', () => {
    const options: MiddlewareOptions = {
      name: 'barBaz/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-baz/foo/foo.middleware.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar-baz/foo/foo.middleware.ts')).toEqual(
      'import { Injectable, MiddlewareFunction, NestMiddleware } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooMiddleware implements NestMiddleware {\n' +
      '  resolve(...args: any[]): MiddlewareFunction {\n' +
      '    return (req, res, next) => {\n' +
      '      next();\n' +
      '    };\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage javascript file', () => {
    const options: MiddlewareOptions = {
      name: 'foo',
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.middleware.js')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.middleware.js')).toEqual(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooMiddleware {\n' +
      '  resolve(...args) {\n' +
      '    return (req, res, next) => {\n' +
      '      next();\n' +
      '    };\n' +
      '  }\n' +
      '}\n'
    );
  });
});
