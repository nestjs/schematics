import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { EntityOptions } from './entity.schema';

describe('Entity Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  it('should manage name only', async () => {
    const options: EntityOptions = {
      name: 'foo',
    };


    const tree: UnitTestTree = await runner
      .runSchematicAsync('entity', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/entities/foo.entity.ts'),
    ).toBeDefined();

    console.log(tree.readContent('/entities/foo.entity.ts'))
    expect(tree.readContent('/entities/foo.entity.ts')).toEqual(
      'export class' + ' Foo' + ' {}\n',
    );
  });

  it('should manage name as a path', async () => {
    const options: EntityOptions = {
      name: 'bar/foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('entity', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/entities/foo.entity.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/entities/foo.entity.ts')).toEqual(
      'export class Foo {}\n',
    );
  });

  it('should manage name and path', async () => {
    const options: EntityOptions = {
      name: 'foo',
      path: 'baz',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('entity', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/entities/foo.entity.ts'),
    ).toBeDefined();
    expect(tree.readContent('/baz/entities/foo.entity.ts')).toEqual(
      'export class Foo {}\n',
    );
  });

  it('should manage name to dasherize', async () => {
    const options: EntityOptions = {
      name: 'fooBar',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('entity', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/entities/foo-bar.entity.ts'),
    ).toBeDefined();
    expect(tree.readContent('/entities/foo-bar.entity.ts')).toEqual(
      'export class FooBar {}\n',
    );
  });

  it('should manage path to dasherize', async () => {
    const options: EntityOptions = {
      name: 'barBaz/foo',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('entity', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/entities/foo.entity.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar-baz/entities/foo.entity.ts')).toEqual(
      'export class Foo {}\n',
    );
  });
});
