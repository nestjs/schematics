import { normalize } from '@angular-devkit/core';
import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { ModuleOptions } from '../../src/module/schema';
import { ServiceOptions } from '../../src/service/schema';

describe('Service Factory', () => {
  describe('Schematic definition', () => {
    context('Manage name only', () => {
      const options: ServiceOptions = {
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
        tree = runner.runSchematic('service', options, appTree);
      });
      it('should generate a new service file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize(`/src/foo/foo.service.ts`)
          )
        ).to.not.be.undefined;
      });
      it('should generate the expected service file content', () => {
        expect(
          tree.readContent(normalize(`/src/foo/foo.service.ts`))
        ).to.be.equal(
          'import { Component } from \'@nestjs/common\';\n' +
          '\n' +
          '@Component()\n' +
          'export class FooService {}\n'
        );
      });
    });
    context('Manage name as a path', () => {
      const options: ServiceOptions = {
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
          name: '',
        };
        const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        tree = runner.runSchematic('service', options, appTree);
      });
      it('should generate a new service file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize(`/src/foo/bar/bar.service.ts`)
          )
        ).to.not.be.undefined;
      });
      it('should generate the expected service file content', () => {
        expect(
          tree.readContent(normalize(`/src/foo/bar/bar.service.ts`))
        ).to.be.equal(
          'import { Component } from \'@nestjs/common\';\n' +
          '\n' +
          '@Component()\n' +
          'export class BarService {}\n'
        );
      });
    });
    context('Manage name and path', () => {
      const options: ServiceOptions = {
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
        tree = runner.runSchematic('service', options, appTree);
      });
      it('should generate a new service file', () => {
        const files: string[] = tree.files;
        expect(
          files.find(
            (filename) => filename === normalize(`/src/bar/foo/foo.service.ts`)
          )
        ).to.not.be.undefined;
      });
      it('should generate the expected service file content', () => {
        expect(
          tree.readContent(normalize(`/src/bar/foo/foo.service.ts`))
        ).to.be.equal(
          'import { Component } from \'@nestjs/common\';\n' +
          '\n' +
          '@Component()\n' +
          'export class FooService {}\n'
        );
      });
    });
  });
  describe('Schematic tree modifications', () => {
    context('Declare service in the app module', () => {
      context('Manage name only', () => {
        const options: ServiceOptions = {
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
          tree = runner.runSchematic('service', options, appTree);
        });
        it('should declare the foo service in the app module', () => {
          expect(
            tree.readContent(normalize('/src/app.module.ts'))
          ).to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { AppController } from \'./app.controller\';\n' +
            'import { FooService } from \'./foo/foo.service\';\n' +
            '\n' +
            '@Module({\n' +
            '  imports: [],\n' +
            '  controllers: [\n' +
            '    AppController\n' +
            '  ],\n' +
            '  components: [\n' +
            '    FooService\n' +
            '  ]\n' +
            '})\n' +
            'export class ApplicationModule {}\n'
          );
        });
      });
      context('Manage name as a path', () => {
        const options: ServiceOptions = {
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
          tree = runner.runSchematic('service', options, root);
        });
        it('should declare the bar service in the app module', () => {
          expect(tree.readContent('/src/app.module.ts'))
            .to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { AppController } from \'./app.controller\';\n' +
            'import { BarService } from \'./foo/bar/bar.service\';\n' +
            '\n' +
            '@Module({\n' +
            '  imports: [],\n' +
            '  controllers: [\n' +
            '    AppController\n' +
            '  ],\n' +
            '  components: [\n' +
            '    BarService\n' +
            '  ]\n' +
            '})\n' +
            'export class ApplicationModule {}\n'
          );
        });
      });
      context('Manage name and path', () => {
        const options: ServiceOptions = {
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
          tree = runner.runSchematic('service', options, root);
        });
        it('should declare the foo service in the app module', () => {
          expect(tree.readContent('/src/app.module.ts'))
            .to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { AppController } from \'./app.controller\';\n' +
            'import { FooService } from \'./bar/foo/foo.service\';\n' +
            '\n' +
            '@Module({\n' +
            '  imports: [],\n' +
            '  controllers: [\n' +
            '    AppController\n' +
            '  ],\n' +
            '  components: [\n' +
            '    FooService\n' +
            '  ]\n' +
            '})\n' +
            'export class ApplicationModule {}\n'
          );
        });
      });
    });
    context('Declare service in an intermediate module', () => {
      context('Manage name only', () => {
        const options: ServiceOptions = {
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
          tree = runner.runSchematic('service', options, root);
        });
        it('should declare the foo service in the foo module', () => {
          expect(
            tree.readContent(normalize('/src/foo/foo.module.ts'))
          ).to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { FooService } from \'./foo.service\';\n' +
            '\n' +
            '@Module({\n' +
            '  components: [\n' +
            '    FooService\n' +
            '  ]\n' +
            '})\n' +
            'export class FooModule {}\n'
          );
        });
      });
      context('Manage name as a path', () => {
        const options: ServiceOptions = {
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
          tree = runner.runSchematic('service', options, root);
        });
        it('should declare the bar service in the foo module', () => {
          expect(
            tree.readContent(normalize('/src/foo/foo.module.ts'))
          ).to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { BarService } from \'./bar/bar.service\';\n' +
            '\n' +
            '@Module({\n' +
            '  components: [\n' +
            '    BarService\n' +
            '  ]\n' +
            '})\n' +
            'export class FooModule {}\n'
          );
        });
      });
      context('Manage name and path', () => {
        const options: ServiceOptions = {
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
          tree = runner.runSchematic('service', options, root);
        });
        it('should declare the foo service in the bar module', () => {
          expect(
            tree.readContent(normalize('/src/bar/bar.module.ts'))
          ).to.be.equal(
            'import { Module } from \'@nestjs/common\';\n' +
            'import { FooService } from \'./foo/foo.service\';\n' +
            '\n' +
            '@Module({\n' +
            '  components: [\n' +
            '    FooService\n' +
            '  ]\n' +
            '})\n' +
            'export class BarModule {}\n'
          );
        });
      });
    });
  });
});
