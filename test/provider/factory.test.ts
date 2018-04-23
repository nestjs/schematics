import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join, normalize } from 'path';
import { ProviderOptions } from '../../src/provider/schema';
import { VirtualTree } from '@angular-devkit/schematics';
import { expect } from 'chai';
import { ApplicationOptions } from '../../src/application/schema';
import { ModuleOptions } from '../../src/module/schema';

describe('Provider Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: ProviderOptions = {
      name: 'foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('provider', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.provider.ts')).to.not.be.undefined;
    expect(tree.readContent('/src/foo/foo.provider.ts')).to.be.equal(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooProvider {}\n'
    );
  });
  it('should manage name has a path', () => {
    const options: ProviderOptions = {
      name: 'bar/foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('provider', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.provider.ts')).to.not.be.undefined;
    expect(tree.readContent('/src/bar/foo/foo.provider.ts')).to.be.equal(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooProvider {}\n'
    );
  });
  it('should manage name and path', () => {
    const options: ProviderOptions = {
      name: 'foo',
      path: 'bar',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('provider', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.provider.ts')).to.not.be.undefined;
    expect(tree.readContent('/src/bar/foo/foo.provider.ts')).to.be.equal(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class FooProvider {}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: ProviderOptions = {
      name: 'bar-foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('provider', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-foo/bar-foo.provider.ts')).to.not.be.undefined;
    expect(tree.readContent('/src/bar-foo/bar-foo.provider.ts')).to.be.equal(
      'import { Injectable } from \'@nestjs/common\';\n' +
      '\n' +
      '@Injectable()\n' +
      'export class BarFooProvider {}\n'
    );
  });
  it('should manage declaration in app module', () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = runner.runSchematic('application', app, new VirtualTree());
    const options: ProviderOptions = {
      name: 'foo'
    };
    tree = runner.runSchematic('provider', options, tree);
    expect(
      tree.readContent(normalize('/src/app.module.ts'))
    ).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      'import { AppService } from \'./app.service\';\n' +
      'import { FooProvider } from \'./foo/foo.provider\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [],\n' +
      '  controllers: [\n' +
      '    AppController\n' +
      '  ],\n' +
      '  providers: [\n' +
      '    AppService,\n' +
      '    FooProvider\n' +
      '  ]\n' +
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
    const options: ProviderOptions = {
      name: 'foo'
    };
    tree = runner.runSchematic('provider', options, tree);
    expect(
      tree.readContent(normalize('/src/foo/foo.module.ts'))
    ).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { FooProvider } from \'./foo.provider\';\n' +
      '\n' +
      '@Module({\n' +
      '  providers: [\n' +
      '    FooProvider\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
});
