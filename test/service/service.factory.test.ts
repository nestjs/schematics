import { normalize } from '@angular-devkit/core';
import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ApplicationOptions } from '../../src/lib/factories/application.schema';
import { ModuleOptions } from '../../src/module/module.schema';
import { ServiceOptions } from '../../src/service/service.schema';

describe('Service Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: ServiceOptions = {
      name: 'foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('service', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo.service.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo.service.ts')).toEqual(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooService {}\n'
    );
  });
  it('should manage name as a path', () => {
    const options: ServiceOptions = {
      name: 'bar/foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('service', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo.service.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo.service.ts')).toEqual(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooService {}\n'
    );
  });
  it('should manage name and path', () => {
    const options: ServiceOptions = {
      name: 'foo',
      path: 'bar',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('service', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo.service.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo.service.ts')).toEqual(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooService {}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: ServiceOptions = {
      name: 'fooBar',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('service', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo-bar.service.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo-bar.service.ts')).toEqual(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooBarService {}\n'
    );
  });
  it('should manage path to dasherize', () => {
    const options: ServiceOptions = {
      name: 'barBaz/foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('service', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-baz/foo.service.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar-baz/foo.service.ts')).toEqual(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooService {}\n'
    );
  });
  it('should manage javascript file', () => {
    const options: ServiceOptions = {
      name: 'foo',
      skipImport: true,
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('service', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo.service.js')).not.toBeUndefined();
    expect(tree.readContent('/src/foo.service.js')).toEqual(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooService {}\n'
    );
  });
  it('should manage declaration in app module', () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = runner.runSchematic('application', app, new VirtualTree());
    const options: ServiceOptions = {
      name: 'foo'
    };
    tree = runner.runSchematic('service', options, tree);
    expect(
      tree.readContent(normalize('/src/app.module.ts'))
    ).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      'import { AppService } from \'./app.service\';\n' +
      'import { FooService } from \'./foo.service\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [],\n' +
      '  controllers: [AppController],\n' +
      '  providers: [AppService, FooService]\n' +
      '})\n' +
      'export class AppModule {}\n'
    );
  });
  it('should manage declaration in foo module', () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = runner.runSchematic('application', app, new VirtualTree());
    const module: ModuleOptions = {
      name: 'foo'
    };
    tree = runner.runSchematic('module', module, tree);
    const options: ServiceOptions = {
      name: 'foo',
      path: 'foo'
    };
    tree = runner.runSchematic('service', options, tree);
    expect(
      tree.readContent(normalize('/src/foo/foo.module.ts'))
    ).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { FooService } from \'./foo.service\';\n' +
      '\n' +
      '@Module({\n' +
      '  providers: [FooService]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
});
