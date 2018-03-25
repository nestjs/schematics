import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { ControllerOptions } from '../../src/controller/schema';
import { ModuleOptions } from '../../src/module/schema';
import { normalize } from '@angular-devkit/core';

describe('Controller Factory', () => {
  describe('Schematic definition', () => {
    context('Manage name only in options', () => {
      const options: ControllerOptions = {
        name: 'foo',
        skipImport: true
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('controller', options, appTree);
      });
      it('should generate a new controller file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize(`/src/foo/foo.controller.ts`)
          )
        ).to.not.be.undefined;
      });
      it('should generate the expected controller file content', () => {
        expect(
          tree.readContent(normalize(`/src/foo/foo.controller.ts`))
        ).to.be.equal(
          'import { Controller } from \'@nestjs/common\';\n' +
          '\n' +
          '@Controller()\n' +
          'export class FooController {}\n'
        );
      });
    });
    context('Manage name has a path in options', () => {
      const options: ControllerOptions = {
        name: 'foo/bar',
        skipImport: true
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('controller', options, appTree);
      });
      it('should generate a new controller file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize(`/src/foo/bar/bar.controller.ts`)
          )
        ).to.not.be.undefined;
      });
      it('should generate the expected controller file content', () => {
        expect(
          tree.readContent(normalize(`/src/foo/bar/bar.controller.ts`))
        ).to.be.equal(
          'import { Controller } from \'@nestjs/common\';\n' +
          '\n' +
          '@Controller()\n' +
          'export class BarController {}\n'
        );
      });
    });
    context('Manage name and path in options', () => {
      const options: ControllerOptions = {
        name: 'foo',
        path: 'bar',
        skipImport: true
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('controller', options, appTree);
      });
      it('should generate a new controller file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize(`/src/bar/foo/foo.controller.ts`)
          )
        ).to.not.be.undefined;
      });
      it('should generate the expected controller file content', () => {
        expect(
          tree.readContent(normalize(`/src/bar/foo/foo.controller.ts`))
        ).to.be.equal(
          'import { Controller } from \'@nestjs/common\';\n' +
          '\n' +
          '@Controller()\n' +
          'export class FooController {}\n'
        );
      });
    });
  });
  describe('Schematic tree modifications', () => {
    context('Import generated controller is an app module controller', () => {
      const options: ControllerOptions = {
        name: 'foo',
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('controller', options, appTree);
      });
      it('should import the new controller in the app module', () => {
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
    });
    context.skip('Generated controller is an app sub module controller', () => {
      const options: ControllerOptions = {
        name: 'name',
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        let root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        const moduleOptions: ModuleOptions = {
          name: options.name
        };
        root = runner.runSchematic('module', moduleOptions, root);
        tree = runner.runSchematic('controller', options, root);
      });
      it('should import the new controller in the sub module', () => {
        expect(tree.readContent(`/src/${options.name}/${options.name}.module.ts`))
          .to.be.equal(
          'import { Module } from \'@nestjs/common\';\n' +
          'import { NameController } from \'./name.controller\';\n' +
          '\n' +
          '@Module({\n' +
          '  controllers: [\n' +
          '    NameController\n' +
          '  ]\n' +
          '})\n' +
          'export class NameModule {}\n'
        );
      });
    });
    context.skip('Generated controller is an app nested sub module controller', () => {
      const options: ControllerOptions = {
        name: 'name',
        path: 'nested/name'
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        let root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        const moduleOptions: ModuleOptions = {
          name: 'nested'
        };
        root = runner.runSchematic('module', moduleOptions, root);
        tree = runner.runSchematic('controller', options, root);
      });
      it('should import the new controller in the nested module', () => {
        expect(tree.readContent(`/src/nested/nested.module.ts`))
          .to.be.equal(
          'import { Module } from \'@nestjs/common\';\n' +
          'import { NameController } from \'./name/name.controller\';\n' +
          '\n' +
          '@Module({\n' +
          '  controllers: [\n' +
          '    NameController\n' +
          '  ]\n' +
          '})\n' +
          'export class NestedModule {}\n'
        );
      });
    });
  });
});
