import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ExceptionOptions } from '../../src/exception/schema';

describe('Exception Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: ExceptionOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/foo/foo.exception.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name as a path', () => {
    const options: ExceptionOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/bar/foo/foo.exception.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name and path', () => {
    const options: ExceptionOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/baz/foo/foo.exception.ts`
      )
    ).to.not.be.undefined;
  });
});
