import { normalize } from '@angular-devkit/core';
import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { ControllerOptions } from '../../src/controller/schema';
import { ModuleOptions } from '../../src/module/schema';

describe('Controller Factory', () => {
  describe('Schematic definition', () => {
    context('Manage name only', () => {
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
          name: '',
        };
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('controller', options, root);
      });
      it('should generate a new controller file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize(`/src/foo/foo.controller.ts`)
          )
        ).to.not.be.undefined;
      });
    });
    context('Manage name as a path', () => {
      const options: ControllerOptions = {
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
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('controller', options, root);
      });
      it('should generate a new controller file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize('/src/bar/foo/foo.controller.ts')
          )
        ).to.not.be.undefined;
      });
    });
    context('Manage name and path', () => {
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
          name: '',
        };
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('controller', options, root);
      });
      it('should generate a new controller file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize(`/src/bar/foo/foo.controller.ts`)
          )
        ).to.not.be.undefined;
      });
    });
    context('Manage name to dasherize', () => {
      const options: ControllerOptions = {
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
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('controller', options, root);
      });
      it('should generate a new controller file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize(`/src/bar-foo/bar-foo.controller.ts`)
          )
        ).to.not.be.undefined;
      });
    });
  });
  describe('Schematic tree modifications', () => {
    context('Declare controller in the app module', () => {
      context('Manage name only', () => {
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
            name: '',
          };
          const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
          tree = runner.runSchematic('controller', options, root);
        });
        it('should declare the foo controller in the app module', () => {
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
      context('Manage name as a path', () => {
        const options: ControllerOptions = {
          name: 'foo/bar',
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
          tree = runner.runSchematic('controller', options, root);
        });
        it('should declare the foo controller in the app module', () => {
          expect(tree.readContent('/src/app.module.ts'))
            .to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { AppController } from \'./app.controller\';\n' +
            'import { BarController } from \'./foo/bar/bar.controller\';\n' +
            '\n' +
            '@Module({\n' +
            '  imports: [],\n' +
            '  controllers: [\n' +
            '    AppController,\n' +
            '    BarController\n' +
            '  ],\n' +
            '  components: []\n' +
            '})\n' +
            'export class ApplicationModule {}\n'
          );
        });
      });
      context('Manage name and path', () => {
        const options: ControllerOptions = {
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
          tree = runner.runSchematic('controller', options, root);
        });
        it('should declare the foo controller in the app module', () => {
          expect(tree.readContent('/src/app.module.ts'))
            .to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { AppController } from \'./app.controller\';\n' +
            'import { FooController } from \'./bar/foo/foo.controller\';\n' +
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
      context('Manage name to dasherize', () => {
        const options: ControllerOptions = {
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
          const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
          tree = runner.runSchematic('controller', options, root);
        });
        it('should declare the foo controller in the app module', () => {
          expect(
            tree.readContent(normalize('/src/app.module.ts'))
          ).to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { AppController } from \'./app.controller\';\n' +
            'import { BarFooController } from \'./bar-foo/bar-foo.controller\';\n' +
            '\n' +
            '@Module({\n' +
            '  imports: [],\n' +
            '  controllers: [\n' +
            '    AppController,\n' +
            '    BarFooController\n' +
            '  ],\n' +
            '  components: []\n' +
            '})\n' +
            'export class ApplicationModule {}\n'
          );
        });
      });
    });
    context('Declare controller in an intermediate module', () => {
      context('Manage name only', () => {
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
            name: '',
          };
          let root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
          const moduleOptions: ModuleOptions = {
            name: 'foo'
          };
          root = runner.runSchematic('module', moduleOptions, root);
          tree = runner.runSchematic('controller', options, root);
        });
        it('should declare the foo controller in the foo module', () => {
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
      context('Manage name as a path', () => {
        const options: ControllerOptions = {
          name: 'foo/bar',
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
          const moduleOptions: ModuleOptions = {
            name: 'foo'
          };
          root = runner.runSchematic('module', moduleOptions, root);
          tree = runner.runSchematic('controller', options, root);
        });
        it('should declare the bar controller in the foo module', () => {
          expect(
            tree.readContent(normalize('/src/foo/foo.module.ts'))
          ).to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { BarController } from \'./bar/bar.controller\';\n' +
            '\n' +
            '@Module({\n' +
            '  controllers: [\n' +
            '    BarController\n' +
            '  ]\n' +
            '})\n' +
            'export class FooModule {}\n'
          );
        });
      });
      context('Manage name and path', () => {
        const options: ControllerOptions = {
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
          const moduleOptions: ModuleOptions = {
            name: 'bar'
          };
          root = runner.runSchematic('module', moduleOptions, root);
          tree = runner.runSchematic('controller', options, root);
        });
        it('should declare the foo controller in the bar module', () => {
          expect(
            tree.readContent(normalize('/src/bar/bar.module.ts'))
          ).to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { FooController } from \'./foo/foo.controller\';\n' +
            '\n' +
            '@Module({\n' +
            '  controllers: [\n' +
            '    FooController\n' +
            '  ]\n' +
            '})\n' +
            'export class BarModule {}\n'
          );
        });
      });
      context('Manage name to dasherize', () => {
        const options: ControllerOptions = {
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
          let root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
          const moduleOptions: ModuleOptions = {
            name: 'barFoo'
          };
          root = runner.runSchematic('module', moduleOptions, root);
          tree = runner.runSchematic('controller', options, root);
        });
        it('should declare the foo controller in the foo module', () => {
          expect(
            tree.readContent(normalize('/src/bar-foo/bar-foo.module.ts'))
          ).to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { BarFooController } from \'./bar-foo.controller\';\n' +
            '\n' +
            '@Module({\n' +
            '  controllers: [\n' +
            '    BarFooController\n' +
            '  ]\n' +
            '})\n' +
            'export class BarFooModule {}\n'
          );
        });
      });
    });
  });
});
