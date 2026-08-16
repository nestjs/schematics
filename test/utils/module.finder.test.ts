import { normalize } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
import { FindOptions, ModuleFinder } from '../../src/utils/module.finder.js';

describe('Module Finder', () => {
  it('should return the app module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'foo',
      path: normalize('/src'),
    };
    expect(finder.find(options)).toEqual(normalize('/src/app.module.ts'));
  });
  it('should return the intermediate module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    tree.create('/src/foo/foo.module.ts', 'foo module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'name',
      path: normalize('/src/foo'),
    };
    expect(finder.find(options)).toEqual(normalize('/src/foo/foo.module.ts'));
  });
  it('should manage javascript module file', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.js', 'app module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'foo',
      path: normalize('/src'),
    };
    expect(finder.find(options)).toEqual(normalize('/src/app.module.js'));
  });

  it('should return null when directory does not exist', () => {
    const tree = new EmptyTree();

    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'foo',
      path: normalize('/src'),
    };
    expect(finder.find(options)).toEqual(null);
  });

  it('should ignore vim swap files', () => {
    const tree = new EmptyTree();
    tree.create('/src/foo/foo.module.ts.swp', 'foo module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'name',
      path: normalize('/src/foo'),
    };
    expect(finder.find(options)).toEqual(null);
  });
});
