import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ModuleOptions } from '../../src/module/schema';
import { ApplicationOptions } from '../../src/application/schema';

describe('Module Factory', () => {
  const appOptions: ApplicationOptions = {
    directory: '',
    extension: 'ts',
    name: 'name'
  };
  const options: ModuleOptions = {
    extension: appOptions.extension,
    name: 'name',
    rootDir: 'src'
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
        filename === `/${options.rootDir }/${ options.name }/${ options.name }.module.${ options.extension }`
      )
    ).to.not.be.undefined;
  });
  it('should generate the expected module file content', () => {
    expect(
      tree
        .readContent(`/${ options.rootDir }/${ options.name }/${ options.name }.module.${ options.extension }`)
    ).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class NameModule {}\n'
    );
  });
  it.skip('should import the new module in the application module', () => {
    expect(
      tree.readContent(`/${ appOptions.directory }/${ options.rootDir }/application.module.${ appOptions.extension }`)
    ).to.match(/import { NameModule } from '.\/name\/name.module'/);
  });
});
