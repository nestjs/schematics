import { normalize } from '@angular-devkit/core';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ApplicationOptions } from '../application/application.schema';
import { ModuleOptions } from '../module/module.schema';
import { ProviderOptions } from './provider.schema';

describe('Provider Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', () => {
    const options: ProviderOptions = {
      name: 'foo',
      skipImport: true,
    };
    const tree: UnitTestTree = runner.runSchematic('provider', options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === '/foo.ts')).toBeDefined();
    expect(files.find(filename => filename === '/foo.spec.ts')).toBeDefined();
    expect(tree.readContent('/foo.ts')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class Foo {}\n',
    );
  });
  it('should manage name has a path', () => {
    const options: ProviderOptions = {
      name: 'bar/foo',
      skipImport: true,
    };
    const tree: UnitTestTree = runner.runSchematic('provider', options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === '/bar/foo.ts')).toBeDefined();
    expect(
      files.find(filename => filename === '/bar/foo.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo.ts')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class Foo {}\n',
    );
  });
  it('should manage name and path', () => {
    const options: ProviderOptions = {
      name: 'foo',
      path: 'bar',
      skipImport: true,
    };
    const tree: UnitTestTree = runner.runSchematic('provider', options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === '/bar/foo.ts')).toBeDefined();
    expect(
      files.find(filename => filename === '/bar/foo.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo.ts')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class Foo {}\n',
    );
  });
  it('should manage name to dasherize', () => {
    const options: ProviderOptions = {
      name: 'bar-foo',
      skipImport: true,
    };
    const tree: UnitTestTree = runner.runSchematic('provider', options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === '/bar-foo.ts')).toBeDefined();
    expect(
      files.find(filename => filename === '/bar-foo.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar-foo.ts')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class BarFoo {}\n',
    );
  });
  it('should manage javascript file', () => {
    const options: ProviderOptions = {
      name: 'foo',
      skipImport: true,
      language: 'js',
    };
    const tree: UnitTestTree = runner.runSchematic('provider', options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === '/foo.js')).toBeDefined();
    expect(files.find(filename => filename === '/foo.spec.js')).toBeDefined();
    expect(tree.readContent('/foo.js')).toEqual(
      "import { Injectable } from '@nestjs/common';\n" +
        '\n' +
        '@Injectable()\n' +
        'export class Foo {}\n',
    );
  });
  it('should manage declaration in app module', () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = runner.runSchematic('application', app);
    const options: ProviderOptions = {
      name: 'foo',
    };
    tree = runner.runSchematic('provider', options, tree);
    expect(tree.readContent(normalize('/src/app.module.ts'))).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { AppController } from './app.controller';\n" +
        "import { AppService } from './app.service';\n" +
        "import { Foo } from './foo';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [],\n' +
        '  controllers: [AppController],\n' +
        '  providers: [AppService, Foo],\n' +
        '})\n' +
        'export class AppModule {}\n',
    );
  });
  it('should manage declaration in foo module', () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = runner.runSchematic('application', app);
    const module: ModuleOptions = {
      name: 'foo',
    };
    tree = runner.runSchematic('module', module, tree);
    const options: ProviderOptions = {
      name: 'foo',
      path: 'foo',
    };
    tree = runner.runSchematic('provider', options, tree);
    expect(tree.readContent(normalize('/src/foo/foo.module.ts'))).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { Foo } from './foo';\n" +
        '\n' +
        '@Module({\n' +
        '  providers: [Foo]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });
});
