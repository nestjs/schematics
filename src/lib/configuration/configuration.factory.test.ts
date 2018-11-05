import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ConfigurationOptions } from './configuration.schema';

describe('Configuration Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage a default configuation', () => {
    const options: ConfigurationOptions = {
      project: 'project',
    };
    const tree: UnitTestTree = runner.runSchematic('configuration', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/project/nest-cli.json'),
    ).not.toBeUndefined();
    expect(JSON.parse(tree.readContent('/project/nest-cli.json'))).toEqual({
      language: 'ts',
      collection: '@nestjs/schematics',
      sourceRoot: 'src',
    });
  });
  it('should manage provided language input', () => {
    const options: ConfigurationOptions = {
      project: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = runner.runSchematic('configuration', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/project/nest-cli.json'),
    ).not.toBeUndefined();
    expect(JSON.parse(tree.readContent('/project/nest-cli.json'))).toEqual({
      language: 'js',
      collection: '@nestjs/schematics',
      sourceRoot: 'src',
    });
  });
  it('should manage provided collection input', () => {
    const options: ConfigurationOptions = {
      project: 'project',
      collection: 'foo',
    };
    const tree: UnitTestTree = runner.runSchematic('configuration', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/project/nest-cli.json'),
    ).not.toBeUndefined();
    expect(JSON.parse(tree.readContent('/project/nest-cli.json'))).toEqual({
      language: 'ts',
      collection: 'foo',
      sourceRoot: 'src',
    });
  });
});
