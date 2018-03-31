import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { MiddlewareOptions } from '../../src/middleware/schema';

describe('Middleware Factory', () => {
  const options: MiddlewareOptions = {
    name: 'name',
  };
  let tree: UnitTestTree;
  before(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('middleware', options, new VirtualTree());
  });
  it('should generate a new middleware file', () => {
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
          filename === `/src/${ options.name }.middleware.ts`
      )
    ).to.not.be.undefined;
  });
});
