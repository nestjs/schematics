import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';

describe('Application Factory', () => {
  it('should generate NestJS application starter project structure', () => {
    const options: ApplicationOptions = {
      directory: 'project'
    };
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    const tree: UnitTestTree = runner.runSchematic('application', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files).to.be.deep.equal([
      '/project/index.js',
      '/project/nodemon.json',
      '/project/package.json',
      '/project/src/app.controller.ts',
      '/project/src/app.module.ts',
      '/project/src/main.ts',
      '/project/tsconfig.json',
      '/project/tslint.json'
    ]);
  });
});
