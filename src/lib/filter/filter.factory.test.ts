import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { FilterOptions } from './filter.schema';

describe('Filter Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  it('should manage name only', () => {
    const options: FilterOptions = {
      name: 'foo',
    };
    const tree: UnitTestTree = runner.runSchematic('filter', options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === '/foo.filter.ts')).toBeDefined();
    expect(tree.readContent('/foo.filter.ts')).toEqual(
      "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
        '\n' +
        '@Catch()\n' +
        'export class FooFilter<T> implements ExceptionFilter {\n' +
        '  catch(exception: T, host: ArgumentsHost) {}\n' +
        '}\n',
    );
  });

  it('should manage name has a path', () => {
    const options: FilterOptions = {
      name: 'bar/foo',
    };
    const tree: UnitTestTree = runner.runSchematic('filter', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar/foo.filter.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo.filter.ts')).toEqual(
      "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
        '\n' +
        '@Catch()\n' +
        'export class FooFilter<T> implements ExceptionFilter {\n' +
        '  catch(exception: T, host: ArgumentsHost) {}\n' +
        '}\n',
    );
  });

  it('should manage name and path', () => {
    const options: FilterOptions = {
      name: 'foo',
      path: 'baz',
    };
    const tree: UnitTestTree = runner.runSchematic('filter', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/baz/foo.filter.ts'),
    ).toBeDefined();
    expect(tree.readContent('/baz/foo.filter.ts')).toEqual(
      "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
        '\n' +
        '@Catch()\n' +
        'export class FooFilter<T> implements ExceptionFilter {\n' +
        '  catch(exception: T, host: ArgumentsHost) {}\n' +
        '}\n',
    );
  });

  it('should manage name to dasherize', () => {
    const options: FilterOptions = {
      name: 'fooBar',
    };
    const tree: UnitTestTree = runner.runSchematic('filter', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/foo-bar.filter.ts'),
    ).toBeDefined();
    expect(tree.readContent('/foo-bar.filter.ts')).toEqual(
      "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
        '\n' +
        '@Catch()\n' +
        'export class FooBarFilter<T> implements ExceptionFilter {\n' +
        '  catch(exception: T, host: ArgumentsHost) {}\n' +
        '}\n',
    );
  });

  it('should manage path to dasherize', () => {
    const options: FilterOptions = {
      name: 'barBaz/foo',
    };
    const tree: UnitTestTree = runner.runSchematic('filter', options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/bar-baz/foo.filter.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar-baz/foo.filter.ts')).toEqual(
      "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
        '\n' +
        '@Catch()\n' +
        'export class FooFilter<T> implements ExceptionFilter {\n' +
        '  catch(exception: T, host: ArgumentsHost) {}\n' +
        '}\n',
    );
  });

  it('should manage javascript file', () => {
    const options: FilterOptions = {
      name: 'foo',
      language: 'js',
    };
    const tree: UnitTestTree = runner.runSchematic('filter', options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === '/foo.filter.js')).toBeDefined();
    expect(tree.readContent('/foo.filter.js')).toEqual(
      "import { Catch } from '@nestjs/common';\n" +
        '\n' +
        '@Catch()\n' +
        'export class FooFilter {\n' +
        '  catch(exception, host) {}\n' +
        '}\n',
    );
  });

  it('should add source root to path', () => {
    const options: FilterOptions = {
      name: 'foo',
      language: 'js',
    };
    let tree: UnitTestTree = runner.runSchematic('application', { name: '' });
    tree = runner.runSchematic('filter', options, tree);

    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === '/src/foo.filter.js'),
    ).toBeDefined();
    expect(tree.readContent('/src/foo.filter.js')).toEqual(
      "import { Catch } from '@nestjs/common';\n" +
        '\n' +
        '@Catch()\n' +
        'export class FooFilter {\n' +
        '  catch(exception, host) {}\n' +
        '}\n',
    );
  });
});
