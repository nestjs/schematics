import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { PipeOptions } from '../../src/pipe/schema';

describe('Pipe Factory', () => {
  const options: PipeOptions = {
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
  it('should generate a new pipe file', () => {
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/${ options.rootDir }/${ options.path }/${ options.name }.pipe.${ options.extension }`
      )
    ).to.not.be.undefined;
  });
});
