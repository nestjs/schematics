import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { AssetOptions } from '../../src/schemas';

describe.skip('Module Factory', () => {
  const options: AssetOptions = {
    extension: 'ts',
    name: 'name',
    path: 'name',
    rootDir: 'src/modules'
  };
  let runner: SchematicTestRunner;
  beforeEach(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('should create a new module file', () => {
    const tree: UnitTestTree = runner.runSchematic('module', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find(
        (filename) => filename === `/src/modules/${ options.path }/${ options.name }.module.${ options.extension }`
      )
    ).to.not.be.undefined;
  });
  it('should create the expected content in the new module file', () => {
    const tree: UnitTestTree = runner.runSchematic('module', options, new VirtualTree());
    expect(
      tree
        .read(`/${ options.rootDir }/${ options.path }/${ options.name }.module.${ options.extension }`)
        .toString()
    ).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class NameModule {}\n'
    );
  });
});
