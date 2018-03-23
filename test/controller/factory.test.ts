import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ControllerOptions } from '../../src/controller/schema';

describe('Controller Factory', () => {
  const options: ControllerOptions = {
    name: 'name',
  };
  let tree: UnitTestTree;
  beforeEach(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('controller', options, new VirtualTree());
  });
  it('should generate a new controller file', () => {
    const files: string[] = tree.files;
    expect(
      files.find(
        (filename) => filename === `/src/${ options.name }/${ options.name }.controller.ts`
      )
    ).to.not.be.undefined;
  });
  it('should generate the expected controller file content', () => {
    expect(
      tree
        .readContent(path.join(
          '/src',
          options.name,
          `${ options.name }.controller.ts`
        ))
    ).to.be.equal(
      'import { Controller } from \'@nestjs/common\';\n' +
      '\n' +
      '@Controller()\n' +
      'export class NameController {}\n'
    );
  });
});
