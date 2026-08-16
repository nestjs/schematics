import { Tree } from '@angular-devkit/schematics';
import {
  NodeDependencyType,
  addPackageJsonDependency,
  getPackageJsonDependency,
} from '../../src/utils/dependencies.utils.js';

const treeWith = (packageJson: Record<string, unknown>) => {
  const tree = Tree.empty();
  tree.create('/package.json', JSON.stringify(packageJson, null, 2));
  return tree;
};

const parse = (tree: Tree) =>
  JSON.parse(tree.read('/package.json')!.toString());

describe('addPackageJsonDependency', () => {
  it('should add a runtime dependency', () => {
    const tree = treeWith({ dependencies: {} });

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@nestjs/core',
      version: '^11.0.0',
    });

    expect(parse(tree).dependencies['@nestjs/core']).toEqual('^11.0.0');
  });

  it('should create the dependency section when it is missing', () => {
    const tree = treeWith({ name: 'project' });

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: 'vitest',
      version: '^4.1.2',
    });

    expect(parse(tree).devDependencies.vitest).toEqual('^4.1.2');
  });

  it('should not clobber an existing version by default', () => {
    const tree = treeWith({ dependencies: { rxjs: '^7.0.0' } });

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: 'rxjs',
      version: '^8.0.0',
    });

    expect(parse(tree).dependencies.rxjs).toEqual('^7.0.0');
  });

  it('should replace an existing version when overwrite is set', () => {
    const tree = treeWith({ dependencies: { rxjs: '^7.0.0' } });

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: 'rxjs',
      version: '^8.0.0',
      overwrite: true,
    });

    expect(parse(tree).dependencies.rxjs).toEqual('^8.0.0');
  });

  it('should keep dependency sections independent', () => {
    const tree = treeWith({ dependencies: { rxjs: '^7.0.0' } });

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: 'rxjs',
      version: '^8.0.0',
    });

    expect(parse(tree).dependencies.rxjs).toEqual('^7.0.0');
    expect(parse(tree).devDependencies.rxjs).toEqual('^8.0.0');
  });

  it('should support peer and optional dependencies', () => {
    const tree = treeWith({});

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Peer,
      name: 'reflect-metadata',
      version: '^0.2.2',
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Optional,
      name: 'fsevents',
      version: '^2.3.0',
    });

    expect(parse(tree).peerDependencies['reflect-metadata']).toEqual('^0.2.2');
    expect(parse(tree).optionalDependencies.fsevents).toEqual('^2.3.0');
  });
});

describe('getPackageJsonDependency', () => {
  it('should find a runtime dependency', () => {
    const tree = treeWith({ dependencies: { rxjs: '^7.8.1' } });

    expect(getPackageJsonDependency(tree, 'rxjs')).toEqual({
      type: NodeDependencyType.Default,
      name: 'rxjs',
      version: '^7.8.1',
    });
  });

  it('should find a dev dependency', () => {
    const tree = treeWith({ devDependencies: { vitest: '^4.1.2' } });

    expect(getPackageJsonDependency(tree, 'vitest')).toEqual({
      type: NodeDependencyType.Dev,
      name: 'vitest',
      version: '^4.1.2',
    });
  });

  it('should return null for an unknown dependency', () => {
    const tree = treeWith({ dependencies: { rxjs: '^7.8.1' } });

    expect(getPackageJsonDependency(tree, 'nope')).toBeNull();
  });

  it('should prefer the runtime section when a name appears twice', () => {
    const tree = treeWith({
      dependencies: { rxjs: '^7.8.1' },
      devDependencies: { rxjs: '^8.0.0' },
    });

    expect(getPackageJsonDependency(tree, 'rxjs')?.type).toEqual(
      NodeDependencyType.Default,
    );
  });

  it('should round-trip a dependency it just added', () => {
    const tree = treeWith({});

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: 'oxlint',
      version: '^1.58.0',
    });

    expect(getPackageJsonDependency(tree, 'oxlint')).toEqual({
      type: NodeDependencyType.Dev,
      name: 'oxlint',
      version: '^1.58.0',
    });
  });
});
