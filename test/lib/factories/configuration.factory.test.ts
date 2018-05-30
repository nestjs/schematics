import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ConfigurationOptions } from '../../../src/lib/factories/configuration.schema';

describe('Configuration Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage a default configuation', () => {
    const options: ConfigurationOptions = {
      project: 'project'
    };
    const tree: UnitTestTree = runner.runSchematic('configuration', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/project/.nestcli.json')).not.toBeUndefined();
    expect(tree.readContent('/project/.nestcli.json')).toEqual(JSON.stringify({
      language: 'ts',
      collection: '@nestjs/schematics'
    }, null, 2));
  });
  it('should manage provided language input', () => {
    const options: ConfigurationOptions = {
      project: 'project',
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('configuration', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/project/.nestcli.json')).not.toBeUndefined();
    expect(tree.readContent('/project/.nestcli.json')).toEqual(JSON.stringify({
      language: 'js',
      collection: '@nestjs/schematics'
    }, null, 2));
  });
  it('should manage provided collection input', () => {
    const options: ConfigurationOptions = {
      project: 'project',
      collection: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('configuration', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/project/.nestcli.json')).not.toBeUndefined();
    expect(tree.readContent('/project/.nestcli.json')).toEqual(JSON.stringify({
      language: 'ts',
      collection: 'foo'
    }, null, 2));
  });
});
