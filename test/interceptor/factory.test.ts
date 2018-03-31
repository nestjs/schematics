import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { InterceptorOptions } from '../../src/interceptor/schema';
import { GuardOptions } from '../../src/guard/schema';
import { ApplicationOptions } from '../../src/application/schema';

describe('Interceptor Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: InterceptorOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/foo/foo.interceptor.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name as a path', () => {
    const options: InterceptorOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/bar/foo/foo.interceptor.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name and path', () => {
    const options: InterceptorOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/baz/foo/foo.interceptor.ts`
      )
    ).to.not.be.undefined;
  });
});
