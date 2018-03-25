import { normalize } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
import { expect } from 'chai';
import { FindOptions, ModuleFinder } from '../../src/utils/module.finder';

describe('Module Finder', () => {
  it('should return the app module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'foo',
      path: normalize('/src')
    };
    expect(finder.find(options))
      .to.be.equal(normalize('/src/app.module.ts'));
  });
  it('should return the generated directory module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    tree.create('/src/foo/foo.module.ts', 'foo module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'foo',
      path: normalize('/src')
    };
    expect(finder.find(options))
      .to.equal(normalize('/src/foo/foo.module.ts'));
  });
  it('should return the intermediate module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    tree.create('/src/foo/foo.module.ts', 'foo module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'name',
      path: normalize('/src/foo')
    };
    expect(finder.find(options))
      .to.equal(normalize('/src/foo/foo.module.ts'));
  });
});
