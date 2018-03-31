import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { PipeOptions } from '../../src/pipe/schema';

describe('Pipe Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: PipeOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/foo/foo.pipe.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name as a path', () => {
    const options: PipeOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/bar/foo/foo.pipe.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name and path', () => {
    const options: PipeOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/baz/foo/foo.pipe.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name to dasherize', () => {
    const options: PipeOptions = {
      name: 'fooBar'
    };
    const tree: UnitTestTree = runner.runSchematic('pipe', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/foo-bar/foo-bar.pipe.ts`
      )
    ).to.not.be.undefined;
  });
});
