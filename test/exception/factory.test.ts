import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ExceptionOptions } from '../../src/exception/schema';
import { ApplicationOptions } from '../../src/application/schema';

describe('Exception Factory', () => {
  let tree: UnitTestTree;
  let runner: SchematicTestRunner;
  before(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    const options: ApplicationOptions = {
      name: '',
    };
    tree = runner.runSchematic('application', options, new VirtualTree());
  });
  it('should manage name only', () => {
    const options: ExceptionOptions = {
      name: 'foo'
    };
    tree = runner.runSchematic('exception', options, new VirtualTree());
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
    tree = runner.runSchematic('exception', options, new VirtualTree());
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
      path: 'bar'
    };
    tree = runner.runSchematic('exception', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/bar/foo/foo.exception.ts`
      )
    ).to.not.be.undefined;
  });
});
