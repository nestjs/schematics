import { normalize } from '@angular-devkit/core';
import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ApplicationOptions } from '../../src/lib/factories/application.schema';
import { ModuleOptions } from '../../src/module/schema';

describe('Module Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: ModuleOptions = {
      name: 'foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('module', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.module.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.module.ts')).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage name as a path', () => {
    const options: ModuleOptions = {
      name: 'bar/foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('module', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.module.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo/foo.module.ts')).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage name and path', () => {
    const options: ModuleOptions = {
      name: 'foo',
      path: 'bar',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('module', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.module.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo/foo.module.ts')).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: ModuleOptions = {
      name: 'fooBar',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('module', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo-bar/foo-bar.module.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo-bar/foo-bar.module.ts')).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooBarModule {}\n'
    );
  });
  it('should manage path to dasherize', () => {
    const options: ModuleOptions = {
      name: 'barBaz/foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('module', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-baz/foo/foo.module.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar-baz/foo/foo.module.ts')).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage javascript file', () => {
    const options: ModuleOptions = {
      name: 'foo',
      skipImport: true,
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('module', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.module.js')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.module.js')).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage declaration in app module', () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = runner.runSchematic('application', app, new VirtualTree());
    const options: ModuleOptions = {
      name: 'foo'
    };
    tree = runner.runSchematic('module', options, tree);
    expect(
      tree.readContent(normalize('/src/app.module.ts'))
    ).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      'import { AppService } from \'./app.service\';\n' +
      'import { FooModule } from \'./foo/foo.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [FooModule],\n' +
      '  controllers: [AppController],\n' +
      '  providers: [AppService]\n' +
      '})\n' +
      'export class AppModule {}\n'
    );
  });
  it('should manage declaration in bar module', () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = runner.runSchematic('application', app, new VirtualTree());
    const module: ModuleOptions = {
      name: 'bar'
    };
    tree = runner.runSchematic('module', module, tree);
    const options: ModuleOptions = {
      name: 'bar/foo'
    };
    tree = runner.runSchematic('module', options, tree);
    expect(
      tree.readContent(normalize('/src/bar/bar.module.ts'))
    ).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { FooModule } from \'./foo/foo.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [FooModule]\n' +
      '})\n' +
      'export class BarModule {}\n'
    );
  });
});
