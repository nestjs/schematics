import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { AssetOptions } from '../../src/schemas';
import * as path from "path";
import { VirtualTree } from '@angular-devkit/schematics';

describe('Service Factory', () => {
  const options: AssetOptions = {
    extension: 'ts',
    name: 'name',
    path: 'name',
    rootDir: 'src/modules'
  };
  let runner: SchematicTestRunner;
  beforeEach(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('can call service schematics', () => {
    const tree: UnitTestTree = runner.runSchematic('service', options, new VirtualTree());
  });
});
