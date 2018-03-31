import { normalize } from '@angular-devkit/core';
import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { ModuleOptions } from '../../src/module/schema';

describe('Module Factory', () => {
  describe('Schematic definition', () => {
    context('Manage name only', () => {
      const options: ModuleOptions = {
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
          name: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('module', options, appTree);
      });
      it('should generate a new module file', () => {
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === normalize('/src/foo/foo.module.ts'))
        ).to.not.be.undefined;
      });
    });
    context('Manage name as a path', () => {
      const options: ModuleOptions = {
        name: 'bar/foo',
        skipImport: true
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          name: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('module', options, appTree);
      });
      it('should generate a new module file', () => {
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === normalize('/src/bar/foo/foo.module.ts'))
        ).to.not.be.undefined;
      });
    });
    context('Manage name and path', () => {
      const options: ModuleOptions = {
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
          name: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('module', options, appTree);
      });
      it('should generate a new module file', () => {
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === normalize('/src/bar/foo/foo.module.ts'))
        ).to.not.be.undefined;
      });
    });
    context('Manage name to dasherize', () => {
      const options: ModuleOptions = {
        name: 'barFoo',
        skipImport: true
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          name: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('module', options, appTree);
      });
      it('should generate a new module file', () => {
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === normalize('/src/bar-foo/bar-foo.module.ts'))
        ).to.not.be.undefined;
      });
    });
  });
  describe('Schematic tree modifications', () => {
    context('Manage name only', () => {
      const options: ModuleOptions = {
        name: 'foo',
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          name: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('module', options, appTree);
      });
      it('should declare foo module in the app module', () => {
        expect(
          tree.readContent(normalize('/src/app.module.ts'))
        ).to.be.equal(
          'import { Module } from \'@nestjs/common\';\n' +
          'import { AppController } from \'./app.controller\';\n' +
          'import { FooModule } from \'./foo/foo.module\';\n' +
          '\n' +
          '@Module({\n' +
          '  imports: [\n' +
          '    FooModule\n' +
          '  ],\n' +
          '  controllers: [\n' +
          '    AppController\n' +
          '  ],\n' +
          '  components: []\n' +
          '})\n' +
          'export class ApplicationModule {}\n'
        );
      });
    });
    context('Manage name as a path', () => {
      const options: ModuleOptions = {
        name: 'bar/foo'
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          name: '',
        };
        let root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        const appNestedModuleOptions: ModuleOptions = {
          name: 'bar'
        };
        root = runner.runSchematic('module', appNestedModuleOptions, root);
        tree = runner.runSchematic('module', options, root);
      });
      it('should declare the foo module in the bar module', () => {
        expect(tree.readContent('/src/bar/bar.module.ts'))
          .to.be.equal(
          'import { Module } from \'@nestjs/common\';\n' +
          'import { FooModule } from \'./foo/foo.module\';\n' +
          '\n' +
          '@Module({\n' +
          '  imports: [\n' +
          '    FooModule\n' +
          '  ]\n' +
          '})\n' +
          'export class BarModule {}\n'
        );
      });
    });
    context('Manage name and path', () => {
      const options: ModuleOptions = {
        name: 'foo',
        path: 'bar'
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          name: '',
        };
        let root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        const appNestedModuleOptions: ModuleOptions = {
          name: 'bar'
        };
        root = runner.runSchematic('module', appNestedModuleOptions, root);
        tree = runner.runSchematic('module', options, root);
      });
      it('should declare the foo module in the bar module', () => {
        expect(tree.readContent('/src/bar/bar.module.ts'))
          .to.be.equal(
          'import { Module } from \'@nestjs/common\';\n' +
          'import { FooModule } from \'./foo/foo.module\';\n' +
          '\n' +
          '@Module({\n' +
          '  imports: [\n' +
          '    FooModule\n' +
          '  ]\n' +
          '})\n' +
          'export class BarModule {}\n'
        );
      });
    });
    context('Manage name to dasherize', () => {
      const options: ModuleOptions = {
        name: 'barFoo',
      };
      let tree: UnitTestTree;
      before(() => {
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          name: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('module', options, appTree);
      });
      it('should declare foo module in the app module', () => {
        expect(
          tree.readContent(normalize('/src/app.module.ts'))
        ).to.be.equal(
          'import { Module } from \'@nestjs/common\';\n' +
          'import { AppController } from \'./app.controller\';\n' +
          'import { BarFooModule } from \'./bar-foo/bar-foo.module\';\n' +
          '\n' +
          '@Module({\n' +
          '  imports: [\n' +
          '    BarFooModule\n' +
          '  ],\n' +
          '  controllers: [\n' +
          '    AppController\n' +
          '  ],\n' +
          '  components: []\n' +
          '})\n' +
          'export class ApplicationModule {}\n'
        );
      });
    });
  });
});
