import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ModuleOptions } from '../../src/module/schema';
import { ApplicationOptions } from '../../src/application/schema';

describe('Module Factory', () => {
  const appOptions: ApplicationOptions = {
    directory: '',
  };
  const options: ModuleOptions = {
    name: 'name',
    path: 'app',
    sourceDir: 'src'
  };
  let tree: UnitTestTree;
  before(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    const appTree: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
    tree = runner.runSchematic('module', options, appTree);
  });
  it('should generate a new module file', () => {
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === path.join(
          '/',
          options.sourceDir,
          options.path,
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
          '/',
          options.sourceDir,
          options.path,
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
  it.skip('should import the new module in the application module', () => {
    expect(
      tree.readContent(path.join(
        '/',
        options.sourceDir,
        options.path,
        `app.module.ts`
      ))
    ).to.match(/import { NameModule } from '.\/name\/name.module'/);
  });
});
