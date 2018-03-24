import { normalize } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
import { expect } from 'chai';
import { FindOptions, ModuleFinder } from '../../src/utils/module.finder';

describe('Module Finder', () => {
  it('should return the app module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    tree.create('/src/name/name.controller.ts', 'name controller content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'name',
      path: 'name',
      kind: 'controller'
    };
    expect(finder.find(options))
      .to.be.equal(normalize('/src/app.module.ts'));
  });
  it('should return the generated directory module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    tree.create('/src/name/name.module.ts', 'name module content');
    tree.create('/src/name/name.controller.ts', 'name controller content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'name',
      path: 'name',
      kind: 'controller'
    };
    expect(finder.find(options))
      .to.equal(normalize('/src/name/name.module.ts'));
  });
  it('should return the intermediate module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    tree.create('/src/nested/nested.module.ts', 'nested module content');
    tree.create('/src/nested/name/name.module.ts', 'name module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'name',
      path: 'nested/name',
      kind: 'module'
    };
    expect(finder.find(options))
      .to.equal(normalize('/src/nested/nested.module.ts'));
  });
});
