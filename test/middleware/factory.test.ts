import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { MiddlewareOptions } from '../../src/middleware/schema';
import { InterceptorOptions } from '../../src/interceptor/schema';
import { ApplicationOptions } from '../../src/application/schema';

describe('Middleware Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: MiddlewareOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/foo/foo.middleware.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name as a path', () => {
    const options: MiddlewareOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/bar/foo/foo.middleware.ts`
      )
    ).to.not.be.undefined;
  });
  it('should manage name and path', () => {
    const options: MiddlewareOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/baz/foo/foo.middleware.ts`
      )
    ).to.not.be.undefined;
  });
});
