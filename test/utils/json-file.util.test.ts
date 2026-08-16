import { Tree } from '@angular-devkit/schematics';
import { JSONFile } from '../../src/utils/json-file.util.js';

const read = (tree: Tree, filePath = '/config.json') =>
  tree.read(filePath)!.toString();

const treeWith = (content: string, filePath = '/config.json') => {
  const tree = Tree.empty();
  tree.create(filePath, content);
  return tree;
};

describe('JSONFile', () => {
  it('should throw when the file does not exist', () => {
    expect(() => new JSONFile(Tree.empty(), '/missing.json')).toThrow(
      /Could not read/,
    );
  });

  it('should read a top-level value', () => {
    const file = new JSONFile(
      treeWith('{ "name": "project" }'),
      '/config.json',
    );

    expect(file.get(['name'])).toEqual('project');
  });

  it('should read a nested value', () => {
    const file = new JSONFile(
      treeWith('{ "compilerOptions": { "strict": true } }'),
      '/config.json',
    );

    expect(file.get(['compilerOptions', 'strict'])).toBe(true);
  });

  it('should read an array element by index', () => {
    const file = new JSONFile(
      treeWith('{ "include": ["src", "test"] }'),
      '/config.json',
    );

    expect(file.get(['include', 1])).toEqual('test');
  });

  it('should return the whole document for an empty path', () => {
    const file = new JSONFile(treeWith('{ "a": 1 }'), '/config.json');

    expect(file.get([])).toEqual({ a: 1 });
  });

  it('should return undefined for a missing path', () => {
    const file = new JSONFile(treeWith('{ "a": 1 }'), '/config.json');

    expect(file.get(['nope', 'deeper'])).toBeUndefined();
  });

  it('should tolerate comments and trailing commas', () => {
    const file = new JSONFile(
      treeWith('{\n // a comment\n "a": 1,\n}'),
      '/config.json',
    );

    expect(file.get(['a'])).toEqual(1);
  });

  it('should throw a descriptive error on malformed JSON', () => {
    const file = new JSONFile(treeWith('{ "a": '), '/config.json');

    expect(() => file.get(['a'])).toThrow(/Failed to parse/);
  });

  it('should write a modified value back to the tree', () => {
    const tree = treeWith('{ "name": "project" }');
    const file = new JSONFile(tree, '/config.json');

    file.modify(['name'], 'renamed');

    expect(file.get(['name'])).toEqual('renamed');
    expect(JSON.parse(read(tree)).name).toEqual('renamed');
  });

  it('should add a nested property', () => {
    const tree = treeWith('{ "compilerOptions": {} }');
    const file = new JSONFile(tree, '/config.json');

    file.modify(['compilerOptions', 'strict'], true);

    expect(JSON.parse(read(tree)).compilerOptions.strict).toBe(true);
  });

  it('should insert keys in sorted order by default', () => {
    const tree = treeWith('{ "a": 1, "c": 3 }');
    const file = new JSONFile(tree, '/config.json');

    file.modify(['b'], 2);

    expect(Object.keys(JSON.parse(read(tree)))).toEqual(['a', 'b', 'c']);
  });

  it('should append without sorting when insertion ordering is disabled', () => {
    const tree = treeWith('{ "c": 3, "a": 1 }');
    const file = new JSONFile(tree, '/config.json');

    file.modify(['b'], 2, false);

    expect(Object.keys(JSON.parse(read(tree)))).toEqual(['c', 'a', 'b']);
  });

  it('should remove an existing property', () => {
    const tree = treeWith('{ "a": 1, "b": 2 }');
    const file = new JSONFile(tree, '/config.json');

    file.remove(['a']);

    expect(file.get(['a'])).toBeUndefined();
    expect(JSON.parse(read(tree))).toEqual({ b: 2 });
  });

  it('should be a no-op when removing a missing property', () => {
    const tree = treeWith('{ "a": 1 }');
    const file = new JSONFile(tree, '/config.json');

    file.remove(['missing']);

    expect(JSON.parse(read(tree))).toEqual({ a: 1 });
  });

  it('should preserve formatting of untouched lines', () => {
    const tree = treeWith('{\n  "a": 1,\n  "b": 2\n}');
    const file = new JSONFile(tree, '/config.json');

    file.modify(['b'], 3);

    expect(read(tree)).toContain('"a": 1');
  });
});
