import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { GuardOptions } from './guard.schema';

describe('Guard Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  it('should manage name only', async () => {
    const options: GuardOptions = {
      name: 'foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('guard', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo.guard.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo.guard.ts')).toEqual(
      "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooGuard implements CanActivate {\n' +
        '  canActivate(\n' +
        '    context: ExecutionContext,\n' +
        '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
        '    return true;\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage name has a path', async () => {
    const options: GuardOptions = {
      name: 'bar/foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('guard', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo.guard.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo.guard.ts')).toEqual(
      "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooGuard implements CanActivate {\n' +
        '  canActivate(\n' +
        '    context: ExecutionContext,\n' +
        '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
        '    return true;\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage name and path', async () => {
    const options: GuardOptions = {
      name: 'foo',
      path: 'baz',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('guard', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/foo.guard.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/baz/foo.guard.ts')).toEqual(
      "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooGuard implements CanActivate {\n' +
        '  canActivate(\n' +
        '    context: ExecutionContext,\n' +
        '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
        '    return true;\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage name to normalize', async () => {
    const options: GuardOptions = {
      name: 'fooBar',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('guard', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar.guard.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo-bar.guard.ts')).toEqual(
      "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooBarGuard implements CanActivate {\n' +
        '  canActivate(\n' +
        '    context: ExecutionContext,\n' +
        '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
        '    return true;\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage path to normalize', async () => {
    const options: GuardOptions = {
      name: 'barBaz/foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('guard', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo.guard.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar-baz/foo.guard.ts')).toEqual(
      "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooGuard implements CanActivate {\n' +
        '  canActivate(\n' +
        '    context: ExecutionContext,\n' +
        '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
        '    return true;\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should keep underscore in path and name', async () => {
    const options: GuardOptions = {
      name: '_foo/_bar',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('guard', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_foo/_bar.guard.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/_foo/_bar.guard.ts')).toEqual(
      "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
        "import { Observable } from 'rxjs';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class BarGuard implements CanActivate {\n' +
        '  canActivate(\n' +
        '    context: ExecutionContext,\n' +
        '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
        '    return true;\n' +
        '  }\n' +
        '}\n',
    );
  });

  it('should manage javascript file', async () => {
    const options: GuardOptions = {
      name: 'foo',
      language: 'js',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('guard', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo.guard.js'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo.guard.js')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooGuard {\n' +
        '  canActivate(context) {\n' +
        '    return true;\n' +
        '  }\n' +
        '}\n',
    );
  });
  it('should create a spec file', async () => {
    const options: GuardOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('guard', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.guard.spec.ts'),
    ).not.toBeUndefined();
  });
  it('should create a spec file with custom file suffix', async () => {
    const options: GuardOptions = {
      name: 'foo',
      spec: true,
      specFileSuffix: 'test',
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('guard', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.guard.spec.ts'),
    ).toBeUndefined();
    expect(
      files.find((filename) => filename === '/foo.guard.test.ts'),
    ).not.toBeUndefined();
  });
});
