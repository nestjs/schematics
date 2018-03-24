import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { ModuleOptions } from '../../src/module/schema';

describe('Module Factory', () => {
  describe('Schematic definition', () => {
    const options: ModuleOptions = {
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
      tree = runner.runSchematic('module', options, appTree);
    });
    it('should generate a new module file', () => {
      const files: string[] = tree.files;
      expect(
        files.find((filename) =>
          filename === path.join(
          '/src',
          options.name,
          `${ options.name }.module.ts`
          )
        )
      ).to.not.be.undefined;
    });
    it('should generate the expected module file content', () => {
      expect(
        tree
          .readContent(path.join(
            '/src',
            options.name,
            `${ options.name }.module.ts`
          ))
      ).to.be.equal(
        'import { Module } from \'@nestjs/common\';\n' +
        '\n' +
        '@Module({})\n' +
        'export class NameModule {}\n'
      );
    });
  });
  describe('Schematic tree modifications', () => {
    context('Generated module is an application nested module', () => {
      const options: ModuleOptions = {
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
        tree = runner.runSchematic('module', options, appTree);
      });
      it('should import the new module in the application module', () => {
        expect(
          tree.readContent(path.join(
            '/src',
            'app.module.ts'
          ))
        ).to.be.equal(
          'import { Module } from \'@nestjs/common\';\n' +
          'import { AppController } from \'./app.controller\';\n' +
          'import { NameModule } from \'./name/name.module\';\n' +
          '\n' +
          '@Module({\n' +
          '  imports: [\n' +
          '    NameModule\n' +
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
    context.skip('Generated module is an other nested module', () => {
    });
  });
});
