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
  it('should support missing project name by using the current working directory instead', async () => {
    const options: ConfigurationOptions = {
      project: undefined,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('configuration', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/nest-cli.json'),
    ).not.toBeUndefined();
    expect(JSON.parse(tree.readContent('/nest-cli.json'))).toEqual({
      $schema: 'https://json.schemastore.org/nest-cli',
      collection: '@nestjs/schematics',
      sourceRoot: 'src',
    });
  });
  it('should manage a default configuration', async () => {
    const options: ConfigurationOptions = {
      project: 'project',
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('configuration', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/project/nest-cli.json'),
    ).not.toBeUndefined();
    expect(JSON.parse(tree.readContent('/project/nest-cli.json'))).toEqual({
      $schema: 'https://json.schemastore.org/nest-cli',
      collection: '@nestjs/schematics',
      sourceRoot: 'src',
    });
  });
  it('should manage provided language input', async () => {
    const options: ConfigurationOptions = {
      project: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('configuration', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/project/nest-cli.json'),
    ).not.toBeUndefined();
    expect(JSON.parse(tree.readContent('/project/nest-cli.json'))).toEqual({
      $schema: 'https://json.schemastore.org/nest-cli',
      language: 'js',
      collection: '@nestjs/schematics',
      sourceRoot: 'src',
    });
  });
  it('should manage provided collection input', async () => {
    const options: ConfigurationOptions = {
      project: 'project',
      collection: 'foo',
    };
    const tree: UnitTestTree = await runner.runSchematicAsync('configuration', options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/project/nest-cli.json'),
    ).not.toBeUndefined();
    expect(JSON.parse(tree.readContent('/project/nest-cli.json'))).toEqual({
      $schema: 'https://json.schemastore.org/nest-cli',
      collection: 'foo',
      sourceRoot: 'src',
    });
  });
});
