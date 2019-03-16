import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { InterceptorOptions } from './interceptor.schema';

describe('Interceptor Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  it('should manage name only', () => {
    const options: InterceptorOptions = {
      name: 'foo',
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo.interceptor.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo.interceptor.ts')).toEqual(
      "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooInterceptor implements NestInterceptor {\n' +
        '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
        '    return next.handle();\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage name as a path', () => {
    const options: InterceptorOptions = {
      name: 'bar/foo',
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar/foo.interceptor.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo.interceptor.ts')).toEqual(
      "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooInterceptor implements NestInterceptor {\n' +
        '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
        '    return next.handle();\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage name and path', () => {
    const options: InterceptorOptions = {
      name: 'foo',
      path: 'baz',
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/baz/foo.interceptor.ts'),
    ).toBeDefined();
    expect(tree.readContent('/baz/foo.interceptor.ts')).toEqual(
      "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooInterceptor implements NestInterceptor {\n' +
        '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
        '    return next.handle();\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage name to dasherize', () => {
    const options: InterceptorOptions = {
      name: 'fooBar',
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo-bar.interceptor.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo-bar.interceptor.ts')).toEqual(
      "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooBarInterceptor implements NestInterceptor {\n' +
        '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
        '    return next.handle();\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage path to dasherize', () => {
    const options: InterceptorOptions = {
      name: 'barBaz/foo',
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar-baz/foo.interceptor.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar-baz/foo.interceptor.ts')).toEqual(
      "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooInterceptor implements NestInterceptor {\n' +
        '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
        '    return next.handle();\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage javascript file', () => {
    const options: InterceptorOptions = {
      name: 'foo',
      language: 'js',
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo.interceptor.js'),
    ).toBeDefined();
    expect(tree.readContent('/foo.interceptor.js')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooInterceptor {\n' +
        '  intercept(context, next) {\n' +
        '    return next.handle();\n' +
        '  }\n' +
        '}\n',
    );
  });
});
