import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { InterceptorOptions } from '../../../src/lib/factories/interceptor.schema';

describe('Interceptor Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: InterceptorOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.interceptor.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.interceptor.ts')).toEqual(
      'import { ExecutionContext, Injectable, NestInterceptor } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs\';\n' +
      'import { map } from \'rxjs/operators\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooInterceptor implements NestInterceptor {\n' +
      '  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {\n' +
      '    return call$.pipe(map((data) => ({ data })));\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name as a path', () => {
    const options: InterceptorOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.interceptor.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo/foo.interceptor.ts')).toEqual(
      'import { ExecutionContext, Injectable, NestInterceptor } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs\';\n' +
      'import { map } from \'rxjs/operators\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooInterceptor implements NestInterceptor {\n' +
      '  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {\n' +
      '    return call$.pipe(map((data) => ({ data })));\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name and path', () => {
    const options: InterceptorOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/baz/foo/foo.interceptor.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/baz/foo/foo.interceptor.ts')).toEqual(
      'import { ExecutionContext, Injectable, NestInterceptor } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs\';\n' +
      'import { map } from \'rxjs/operators\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooInterceptor implements NestInterceptor {\n' +
      '  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {\n' +
      '    return call$.pipe(map((data) => ({ data })));\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: InterceptorOptions = {
      name: 'fooBar'
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo-bar/foo-bar.interceptor.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo-bar/foo-bar.interceptor.ts')).toEqual(
      'import { ExecutionContext, Injectable, NestInterceptor } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs\';\n' +
      'import { map } from \'rxjs/operators\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooBarInterceptor implements NestInterceptor {\n' +
      '  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {\n' +
      '    return call$.pipe(map((data) => ({ data })));\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage path to dasherize', () => {
    const options: InterceptorOptions = {
      name: 'barBaz/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-baz/foo/foo.interceptor.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar-baz/foo/foo.interceptor.ts')).toEqual(
      'import { ExecutionContext, Injectable, NestInterceptor } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs\';\n' +
      'import { map } from \'rxjs/operators\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooInterceptor implements NestInterceptor {\n' +
      '  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {\n' +
      '    return call$.pipe(map((data) => ({ data })));\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage javascript file', () => {
    const options: InterceptorOptions = {
      name: 'foo',
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.interceptor.js')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.interceptor.js')).toEqual(
      'import { Injectable } from \'@nestjs/common\';\n' +
      'import { map } from \'rxjs/operators\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooInterceptor {\n' +
      '  intercept(context, call$) {\n' +
      '    return call$.pipe(map((data) => ({ data })));\n' +
      '  }\n' +
      '}\n'
    );
  });
});
