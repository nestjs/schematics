import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { InterfaceOptions } from './interface.schema';

describe('Interface Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  it('should manage name only', () => {
    const options: InterfaceOptions = {
      name: 'foo',
    };
    const tree: UnitTestTree = runner.runSchematic('interface', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo.interface.ts')).toEqual(
      'export interface Foo {}\n',
    );
  });

  it('should manage name as a path', () => {
    const options: InterfaceOptions = {
      name: 'bar/foo',
    };
    const tree: UnitTestTree = runner.runSchematic('interface', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar/foo.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo.interface.ts')).toEqual(
      'export interface Foo {}\n',
    );
  });

  it('should manage name and path', () => {
    const options: InterfaceOptions = {
      name: 'foo',
      path: 'baz',
    };
    const tree: UnitTestTree = runner.runSchematic('interface', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/baz/foo.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/baz/foo.interface.ts')).toEqual(
      'export interface Foo {}\n',
    );
  });

  it('should manage name to dasherize', () => {
    const options: InterfaceOptions = {
      name: 'fooBar',
    };
    const tree: UnitTestTree = runner.runSchematic('interface', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo-bar.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo-bar.interface.ts')).toEqual(
      'export interface FooBar {}\n',
    );
  });

  it('should manage path to dasherize', () => {
    const options: InterfaceOptions = {
      name: 'barBaz/foo',
    };
    const tree: UnitTestTree = runner.runSchematic('interface', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar-baz/foo.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar-baz/foo.interface.ts')).toEqual(
      'export interface Foo {}\n',
    );
  });
});
