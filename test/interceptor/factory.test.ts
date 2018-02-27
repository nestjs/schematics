import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';

export interface InterceptorOptions {
  extension: string;
  name: string;
  path: string;
  rootDir: string;
}

describe('Interceptor Factory', () => {
  const options: InterceptorOptions = {
    extension: 'ts',
    name: 'name',
    path: 'path',
    rootDir: 'src/modules'
  };
  let runner: SchematicTestRunner;
  beforeEach(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('can call interceptor schematics', () => {
    runner.runSchematic('interceptor', options, new VirtualTree());
  });
  it('should generate a new interceptor file', () => {
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/${ options.rootDir }/${ options.path }/${ options.name }.interceptor.${ options.extension }`
      )
    ).to.not.be.undefined;
  });
});
