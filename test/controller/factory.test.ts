import { normalize } from '@angular-devkit/core';
import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { ControllerOptions } from '../../src/controller/schema';
import { ModuleOptions } from '../../src/module/schema';

describe('Controller Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: ControllerOptions = {
      name: 'foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('controller', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/foo/foo.controller.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name as a path', () => {
    const options: ControllerOptions = {
      name: 'bar/foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('controller', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/bar/foo/foo.controller.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name and path', () => {
    const options: ControllerOptions = {
      name: 'foo',
      path: 'bar',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('controller', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/bar/foo/foo.controller.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name to dasherize', () => {
    const options: ControllerOptions = {
      name: 'fooBar',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('controller', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/foo-bar/foo-bar.controller.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage path to dasherize', () => {
    const options: ControllerOptions = {
      name: 'barBaz/foo',
      skipImport: true
    };
    const tree: UnitTestTree = runner.runSchematic('controller', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/bar-baz/foo/foo.controller.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage declaration in app module', () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = runner.runSchematic('application', app, new VirtualTree());
    const options: ControllerOptions = {
      name: 'foo'
    };
    tree = runner.runSchematic('controller', options, tree);
    expect(
      tree.readContent(normalize('/src/app.module.ts'))
    ).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      'import { FooController } from \'./foo/foo.controller\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [],\n' +
      '  controllers: [\n' +
      '    AppController,\n' +
      '    FooController\n' +
      '  ],\n' +
      '  components: []\n' +
      '})\n' +
      'export class ApplicationModule {}\n'
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
    const options: ControllerOptions = {
      name: 'foo'
    };
    tree = runner.runSchematic('controller', options, tree);
    expect(
      tree.readContent(normalize('/src/foo/foo.module.ts'))
    ).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { FooController } from \'./foo.controller\';\n' +
      '\n' +
      '@Module({\n' +
      '  controllers: [\n' +
      '    FooController\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
});
