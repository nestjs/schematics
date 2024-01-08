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

  it('should manage name only', async () => {
    const options: InterfaceOptions = {
      name: 'foo',
    };
    const tree: UnitTestTree = await runner.runSchematic('interface', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo.interface.ts')).toEqual(
      'export interface Foo {}\n',
    );
  });

  it('should manage name as a path', async () => {
    const options: InterfaceOptions = {
      name: 'bar/foo',
    };
    const tree: UnitTestTree = await runner.runSchematic('interface', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo.interface.ts')).toEqual(
      'export interface Foo {}\n',
    );
  });

  it('should manage name and path', async () => {
    const options: InterfaceOptions = {
      name: 'foo',
      path: 'baz',
    };
    const tree: UnitTestTree = await runner.runSchematic('interface', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/foo.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/baz/foo.interface.ts')).toEqual(
      'export interface Foo {}\n',
    );
  });

  it('should manage name to normalize', async () => {
    const options: InterfaceOptions = {
      name: 'fooBar',
    };
    const tree: UnitTestTree = await runner.runSchematic('interface', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo-bar.interface.ts')).toEqual(
      'export interface FooBar {}\n',
    );
  });

  it('should manage path to normalize', async () => {
    const options: InterfaceOptions = {
      name: 'barBaz/foo',
    };
    const tree: UnitTestTree = await runner.runSchematic('interface', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar-baz/foo.interface.ts')).toEqual(
      'export interface Foo {}\n',
    );
  });

  it("should keep underscores in interface's path and file names", async () => {
    const options: InterfaceOptions = {
      name: '_bar/_foo',
    };
    const tree: UnitTestTree = await runner.runSchematic('interface', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_bar/_foo.interface.ts'),
    ).toBeDefined();
    expect(tree.readContent('/_bar/_foo.interface.ts')).toEqual(
      'export interface Foo {}\n',
    );
  });
});
