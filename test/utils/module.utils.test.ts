import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ModuleUtils } from '../../src/utils/module.utils';

describe('Module Utils', () => {
  it('should return the app module path in application tree', () => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    const tree: UnitTestTree = runner.runSchematic('application', { directory: 'directory' }, new VirtualTree());
    expect(ModuleUtils.find(tree, 'app')).to.be.equal('/src/app.module.ts');
  });
});
