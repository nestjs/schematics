import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { ControllerOptions } from '../../src/controller/schema';
import { ModuleOptions } from '../../src/module/schema';

describe('Controller Factory', () => {
  describe('No module in controller generate directory', () => {
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
      const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
      tree = runner.runSchematic('controller', options, appTree);
    });
    it('should generate a new controller file', () => {
      const files: string[] = tree.files;
      expect(
        files.find(
          (filename) => filename === `/src/${ options.name }/${ options.name }.controller.ts`
        )
      ).to.not.be.undefined;
    });
    it('should generate the expected controller file content', () => {
      expect(
        tree
          .readContent(path.join(
            '/src',
            options.name,
            `${ options.name }.controller.ts`
          ))
      ).to.be.equal(
        'import { Controller } from \'@nestjs/common\';\n' +
        '\n' +
        '@Controller()\n' +
        'export class NameController {}\n'
      );
    });
    it('should import the new controller in the application module', () => {
      expect(
        tree.readContent(path.join(
          '/src',
          'app.module.ts'
        ))
      ).to.be.equal(
        'import { Module } from \'@nestjs/common\';\n' +
        'import { AppController } from \'./app.controller\';\n' +
        'import { NameController } from \'./name/name.controller\';\n' +
        '\n' +
        '@Module({\n' +
        '  imports: [],\n' +
        '  controllers: [\n' +
        '    AppController,\n' +
        '    NameController\n' +
        '  ],\n' +
        '  components: []\n' +
        '})\n' +
        'export class ApplicationModule {}\n'
      );
    });
  });
  describe('Generated module before controller generation', () => {
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
    it.skip('should import the new controller in the generated directory module', () => {
      expect(tree.readContent(`/src/${options.name}/${options.name}.module.ts`))
        .to.be.equal(
        'import { Module } from \'@nestjs/common\';\n' +
        'import { NameController } from \'./name.controller\';\n' +
        '\n' +
        '@Module({\n' +
        '  controllers: [\n' +
        '    NameController\n' +
        '  ],\n' +
        '})\n' +
        'export class NameModule {}\n'
      );
    });
  });
});
