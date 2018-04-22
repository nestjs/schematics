import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { ConfigurationOptions } from '../../src/configuration/schema';
import * as path from 'path';
import { VirtualTree } from '@angular-devkit/schematics';
import { expect } from 'chai';

describe('Configuration Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage a default configuation', () => {
    const options: ConfigurationOptions = {};
    const tree: UnitTestTree = runner.runSchematic('configuration', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/.nestcli.json')).to.not.be.undefined;
    expect(tree.readContent('/.nestcli.json')).to.be.equal(JSON.stringify({
      language: 'ts',
      collection: '@nestjs/schematics'
    }, null, 2));
  });
  it('should manage provided language input', () => {
    const options: ConfigurationOptions = {
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('configuration', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/.nestcli.json')).to.not.be.undefined;
    expect(tree.readContent('/.nestcli.json')).to.be.equal(JSON.stringify({
      language: 'js',
      collection: '@nestjs/schematics'
    }, null, 2));
  });
  it('should manage provided collection input', () => {
    const options: ConfigurationOptions = {
      collection: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('configuration', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/.nestcli.json')).to.not.be.undefined;
    expect(tree.readContent('/.nestcli.json')).to.be.equal(JSON.stringify({
      language: 'ts',
      collection: 'foo'
    }, null, 2));
  });
});
