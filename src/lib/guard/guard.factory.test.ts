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

  it('should manage name only', () => {
    const options: GuardOptions = {
      name: 'foo',
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo.guard.ts'),
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

  it('should manage name has a path', () => {
    const options: GuardOptions = {
      name: 'bar/foo',
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar/foo.guard.ts'),
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

  it('should manage name and path', () => {
    const options: GuardOptions = {
      name: 'foo',
      path: 'baz',
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/baz/foo.guard.ts'),
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

  it('should manage name to dasherize', () => {
    const options: GuardOptions = {
      name: 'fooBar',
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo-bar.guard.ts'),
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

  it('should manage path to dasherize', () => {
    const options: GuardOptions = {
      name: 'barBaz/foo',
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar-baz/foo.guard.ts'),
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

  it('should manage javascript file', () => {
    const options: GuardOptions = {
      name: 'foo',
      language: 'js',
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo.guard.js'),
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
});
