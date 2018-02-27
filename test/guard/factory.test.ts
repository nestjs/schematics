import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

export interface GuardOptions {}

describe('Guard Factory', () => {
  const options: GuardOptions = {};
  let runner: SchematicTestRunner;
  beforeEach(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('can call guard schematics', () => {
    runner.runSchematic('guard', options, new VirtualTree());
  });
});
