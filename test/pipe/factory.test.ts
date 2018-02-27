import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from "path";
import { PipeOptions } from '../../src/pipe/schema';

describe('Pipe Factory', () => {
  const options: PipeOptions = {};
  let runner: SchematicTestRunner;
  beforeEach(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('can call pipe schematics', () => {
    runner.runSchematic('pipe', options, new VirtualTree());
  });
});
