import { normalize } from '@angular-devkit/core';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ApplicationOptions } from '../application/application.schema';
import { ModuleOptions } from '../module/module.schema';
import { ServiceOptions } from './service.schema';

describe('Service Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: ServiceOptions = {
      name: 'foo',
      skipImport: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('service', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo.service.ts'),
    ).toBeDefined();
    expect(
      files.find(filename => filename === '/foo.service.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo.service.ts')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooService {}\n',
    );
  });
  it('should manage name as a path', async () => {
    const options: ServiceOptions = {
      name: 'bar/foo',
      skipImport: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('service', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar/foo.service.ts'),
    ).toBeDefined();
    expect(
      files.find(filename => filename === '/bar/foo.service.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo.service.ts')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooService {}\n',
    );
  });
  it('should manage name and path', async () => {
    const options: ServiceOptions = {
      name: 'foo',
      path: 'bar',
      skipImport: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('service', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar/foo.service.ts'),
    ).toBeDefined();
    expect(
      files.find(filename => filename === '/bar/foo.service.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo.service.ts')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooService {}\n',
    );
  });
  it('should manage name to dasherize', async () => {
    const options: ServiceOptions = {
      name: 'fooBar',
      skipImport: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('service', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo-bar.service.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo-bar.service.ts')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooBarService {}\n',
    );
  });
  it('should manage path to dasherize', async () => {
    const options: ServiceOptions = {
      name: 'barBaz/foo',
      skipImport: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('service', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar-baz/foo.service.ts'),
    ).toBeDefined();
    expect(
      files.find(filename => filename === '/bar-baz/foo.service.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar-baz/foo.service.ts')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooService {}\n',
    );
  });
  it('should manage javascript file', async () => {
    const options: ServiceOptions = {
      name: 'foo',
      skipImport: true,
      language: 'js',
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('service', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo.service.js'),
    ).toBeDefined();
    expect(
      files.find(filename => filename === '/foo.service.spec.js'),
    ).toBeDefined();
    expect(tree.readContent('/foo.service.js')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class FooService {}\n',
    );
  });
  it('should manage declaration in app module', async () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = await runner.runSchematicAsync('application', app).toPromise();
    const options: ServiceOptions = {
      name: 'foo',
      flat: true,
    };
    tree = await runner.runSchematicAsync('service', options, tree).toPromise();
    expect(tree.readContent(normalize('/src/app.module.ts'))).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { AppController } from './app.controller';\n" +
        "import { AppService } from './app.service';\n" +
        "import { FooService } from './foo.service';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [],\n' +
        '  controllers: [AppController],\n' +
        '  providers: [AppService, FooService],\n' +
        '})\n' +
        'export class AppModule {}\n',
    );
  });
  it('should manage declaration in foo module', async () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = await runner.runSchematicAsync('application', app).toPromise();
    const module: ModuleOptions = {
      name: 'foo',
    };
    tree = await runner.runSchematicAsync('module', module, tree).toPromise();;
    const options: ServiceOptions = {
      name: 'foo',
      path: 'foo',
      flat: true,
    };
    tree = await runner.runSchematicAsync('service', options, tree).toPromise();
    expect(tree.readContent(normalize('/src/foo/foo.module.ts'))).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { FooService } from './foo.service';\n" +
        '\n' +
        '@Module({\n' +
        '  providers: [FooService]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });
});
