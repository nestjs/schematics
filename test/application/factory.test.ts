import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';

describe('Application Factory', () => {
  const options: ApplicationOptions = {
    name: 'name'
  };
  let tree: UnitTestTree;
  before(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('application', options, new VirtualTree());
  });
  it('should generate Nest application starter project structure', () => {
    const files: string[] = tree.files;
    expect(files).to.be.deep.equal([
      '/name/.prettierrc',
      '/name/README.md',
      '/name/nodemon.json',
      '/name/package.json',
      '/name/src/app.controller.spec.ts',
      '/name/src/app.controller.ts',
      '/name/src/app.module.ts',
      '/name/src/main.ts',
      '/name/test/app.e2e-spec.ts',
      '/name/test/jest-e2e.json',
      '/name/tsconfig.json',
      '/name/tslint.json'
    ]);
  });
});
