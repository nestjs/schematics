import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';

describe('Application Factory', () => {
  it('should generate NestJS application starter project structure', () => {
    const options: ApplicationOptions = {
      name: 'project'
    };
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    const tree: UnitTestTree = runner.runSchematic('application', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files).to.be.deep.equal([
      '/project/.prettierrc',
      '/project/nodemon.json',
      '/project/package.json',
      '/project/src/app.controller.spec.ts',
      '/project/src/app.controller.ts',
      '/project/src/app.module.ts',
      '/project/src/main.ts',
      '/project/test/app.e2e-spec.ts',
      '/project/test/jest-e2e.json',
      '/project/tsconfig.json',
      '/project/tslint.json'
    ]);
  });
  it('should dasherize the name name', () => {
    const options: ApplicationOptions = {
      name: 'awesomeProject'
    };
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    const tree: UnitTestTree = runner.runSchematic('application', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files).to.be.deep.equal([
      '/awesome-project/.prettierrc',
      '/awesome-project/nodemon.json',
      '/awesome-project/package.json',
      '/awesome-project/src/app.controller.spec.ts',
      '/awesome-project/src/app.controller.ts',
      '/awesome-project/src/app.module.ts',
      '/awesome-project/src/main.ts',
      '/awesome-project/test/app.e2e-spec.ts',
      '/awesome-project/test/jest-e2e.json',
      '/awesome-project/tsconfig.json',
      '/awesome-project/tslint.json'
    ]);
  });
});
