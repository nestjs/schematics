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

  it('should manage name only', async () => {
    const options: InterceptorOptions = {
      name: 'foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('interceptor', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo.interceptor.ts'),
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

  it('should manage name as a path', async () => {
    const options: InterceptorOptions = {
      name: 'bar/foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('interceptor', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo.interceptor.ts'),
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

  it('should manage name and path', async () => {
    const options: InterceptorOptions = {
      name: 'foo',
      path: 'baz',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('interceptor', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/foo.interceptor.ts'),
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

  it('should manage name to normalize', async () => {
    const options: InterceptorOptions = {
      name: 'fooBar',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('interceptor', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar.interceptor.ts'),
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

  it("should keep underscores in interceptor's path and file name", async () => {
    const options: InterceptorOptions = {
      name: '_bar/_foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('interceptor', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_bar/_foo.interceptor.ts'),
    ).toBeDefined();
    expect(tree.readContent('/_bar/_foo.interceptor.ts')).toEqual(
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

  it('should manage path to normalize', async () => {
    const options: InterceptorOptions = {
      name: 'barBaz/foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('interceptor', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo.interceptor.ts'),
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

  it('should manage javascript file', async () => {
    const options: InterceptorOptions = {
      name: 'foo',
      language: 'js',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('interceptor', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo.interceptor.js'),
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
  it('should create a spec file', async () => {
    const options: InterceptorOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('interceptor', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.interceptor.spec.ts'),
    ).not.toBeUndefined();
  });
  it('should create a spec file with custom file suffix', async () => {
    const options: InterceptorOptions = {
      name: 'foo',
      spec: true,
      specFileSuffix: 'test',
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('interceptor', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.interceptor.spec.ts'),
    ).toBeUndefined();
    expect(
      files.find((filename) => filename === '/foo.interceptor.test.ts'),
    ).not.toBeUndefined();
  });
});
