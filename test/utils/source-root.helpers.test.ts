import { Tree } from '@angular-devkit/schematics';
import {
  isEsmProject,
  isInRootDirectory,
  mergeSourceRoot,
} from '../../src/utils/source-root.helpers.js';

describe('isEsmProject', () => {
  it('should detect an ESM project from the package.json type field', () => {
    const tree = Tree.empty();
    tree.create('package.json', JSON.stringify({ type: 'module' }));

    expect(isEsmProject(tree)).toBe(true);
  });

  it('should treat an explicit commonjs type as CJS', () => {
    const tree = Tree.empty();
    tree.create('package.json', JSON.stringify({ type: 'commonjs' }));

    expect(isEsmProject(tree)).toBe(false);
  });

  it('should treat a missing type field as CJS', () => {
    const tree = Tree.empty();
    tree.create('package.json', JSON.stringify({ name: 'project' }));

    expect(isEsmProject(tree)).toBe(false);
  });

  it('should return false when there is no package.json', () => {
    expect(isEsmProject(Tree.empty())).toBe(false);
  });

  it('should return false instead of throwing on a malformed package.json', () => {
    const tree = Tree.empty();
    tree.create('package.json', '{ not valid json');

    expect(() => isEsmProject(tree)).not.toThrow();
    expect(isEsmProject(tree)).toBe(false);
  });
});

describe('isInRootDirectory', () => {
  it('should detect the root directory through nest-cli.json', () => {
    const tree = Tree.empty();
    tree.create('nest-cli.json', '{}');

    expect(isInRootDirectory(tree)).toBe(true);
  });

  it('should detect the root directory through the legacy nest.json', () => {
    const tree = Tree.empty();
    tree.create('nest.json', '{}');

    expect(isInRootDirectory(tree)).toBe(true);
  });

  it('should consider the extra files passed by the caller', () => {
    const tree = Tree.empty();
    tree.create('package.json', '{}');

    expect(isInRootDirectory(tree)).toBe(false);
    expect(isInRootDirectory(tree, ['package.json'])).toBe(true);
  });

  it('should return false for an empty tree', () => {
    expect(isInRootDirectory(Tree.empty())).toBe(false);
  });
});

describe('mergeSourceRoot', () => {
  it('should prefix the path with the default source root when in the root directory', async () => {
    const tree = Tree.empty();
    tree.create('nest-cli.json', '{}');
    const options = { path: 'foo' };

    await mergeSourceRoot(options)(tree, {} as any);

    expect(options.path).toEqual('src/foo');
  });

  it('should honour a custom source root', async () => {
    const tree = Tree.empty();
    tree.create('nest-cli.json', '{}');
    const options = { sourceRoot: 'custom', path: 'foo' };

    await mergeSourceRoot(options)(tree, {} as any);

    expect(options.path).toEqual('custom/foo');
  });

  it('should fall back to the source root when no path is provided', async () => {
    const tree = Tree.empty();
    tree.create('nest-cli.json', '{}');
    const options: { path?: string } = {};

    await mergeSourceRoot(options)(tree, {} as any);

    expect(options.path).toEqual('src');
  });

  it('should leave the path untouched outside of the root directory', async () => {
    const tree = Tree.empty();
    const options = { path: 'foo' };

    await mergeSourceRoot(options)(tree, {} as any);

    expect(options.path).toEqual('foo');
  });
});
