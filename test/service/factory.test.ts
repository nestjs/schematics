import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ServiceOptions } from '../../src/service/schema';

describe('Service Factory', () => {
  const options: ServiceOptions = {
    name: 'name',
  };
  let tree: UnitTestTree;
  beforeEach(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('service', options, new VirtualTree());
  });
  it('should generate a new service file', () => {
    const files: string[] = tree.files;
    expect(
      files.find(
        (filename) => filename === `/src/${ options.name }.service.ts`
      )
    ).to.not.be.undefined;
  });
  it('should generate the expected service file content', () => {
    expect(
      tree.readContent(`/src/${ options.name }.service.ts`)
    ).to.be.equal(
      'import { Component } from \'@nestjs/common\';\n' +
      '\n' +
      '@Component()\n' +
      'export class NameService {}\n'
    );
  });
});
