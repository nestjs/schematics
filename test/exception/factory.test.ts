import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Exception Factory', () => {
  const options: any = {};
  let runner: SchematicTestRunner;
  beforeEach(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('can call exception schematics', () => {
    runner.runSchematic('exception', options, new VirtualTree());
  });
});
