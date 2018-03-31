import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';

describe('Application Factory', () => {
  const options: ApplicationOptions = {
    directory: 'directory'
  };
  let tree: UnitTestTree;
  before(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('application', options, new VirtualTree());
  });
  it('should generate Nest application starter project structure',
    () => {
      const files: string[] = tree.files;
      expect(files).to.be.deep.equal([
        '/directory/.prettierrc',
        '/directory/README.md',
        '/directory/nodemon.json',
        '/directory/package.json',
        '/directory/src/app.controller.spec.ts',
        '/directory/src/app.controller.ts',
        '/directory/src/app.module.ts',
        '/directory/src/main.ts',
        '/directory/test/app.e2e-spec.ts',
        '/directory/test/jest-e2e.json',
        '/directory/tsconfig.json',
        '/directory/tslint.json'
      ]);
    });
});
