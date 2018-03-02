import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ModuleOptions } from '../../src/module/schema';

describe('Module Factory', () => {
  const options: ModuleOptions = {
    extension: 'ts',
    name: 'name',
    rootDir: 'src'
  };
  let tree: UnitTestTree;
  beforeEach(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('module', options, new VirtualTree());
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
});
