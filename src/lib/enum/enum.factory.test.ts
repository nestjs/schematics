import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { EnumOptions } from './enum.schema';

describe('Enum Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  it('should manage name only', async () => {
    const options: EnumOptions = {
      name: 'foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('enum', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/foo.enum.ts')).toBeDefined();
    expect(tree.readContent('/foo.enum.ts')).toEqual('export enum Foo {}\n');
  });

  it('should manage name as a path', async () => {
    const options: EnumOptions = {
      name: 'bar/foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('enum', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo.enum.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo.enum.ts')).toEqual(
      'export enum Foo {}\n',
    );
  });

  it('should manage name and path', async () => {
    const options: EnumOptions = {
      name: 'foo',
      path: 'baz',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('enum', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/foo.enum.ts'),
    ).toBeDefined();
    expect(tree.readContent('/baz/foo.enum.ts')).toEqual(
      'export enum Foo {}\n',
    );
  });

  it('should manage name to normalize', async () => {
    const options: EnumOptions = {
      name: 'fooBar',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('enum', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar.enum.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo-bar.enum.ts')).toEqual(
      'export enum FooBar {}\n',
    );
  });

  it('should manage path to normalize', async () => {
    const options: EnumOptions = {
      name: 'barBaz/foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('enum', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo.enum.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar-baz/foo.enum.ts')).toEqual(
      'export enum Foo {}\n',
    );
  });

  it("should keep underscores in enum's path and file names", async () => {
    const options: EnumOptions = {
      name: '_bar/_foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('enum', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_bar/_foo.enum.ts'),
    ).toBeDefined();
    expect(tree.readContent('/_bar/_foo.enum.ts')).toEqual(
      'export enum Foo {}\n',
    );
  });
});
