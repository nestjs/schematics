import {
    SchematicTestRunner,
    UnitTestTree,
  } from '@angular-devkit/schematics/testing';
  import * as path from 'path';
  import { RepositoryOptions } from './repository.schema';
  
  describe('Repository Factory', () => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json'),
    );
    it('should manage name only', async () => {
      const options: RepositoryOptions = {
        name: 'foo',
        spec: true,
        flat: true,
      };
      const tree: UnitTestTree = await runner.runSchematicAsync('repository', options).toPromise();
      const files: string[] = tree.files;
  
      expect(files.find(filename => filename === '/foo.repository.ts')).not.toBeUndefined();
      expect(tree.readContent('/foo.repository.ts')).toEqual('export class FooRepository {}\n');
    });
    it('should manage name as a path', async () => {
      const options: RepositoryOptions = {
        name: 'bar/foo',
        flat: false,
        spec: false,
      };
      const tree: UnitTestTree = await runner.runSchematicAsync('repository', options).toPromise();
      const files: string[] = tree.files;
  
      expect(
        files.find(filename => filename === '/bar/foo/foo.repository.ts'),
      ).not.toBeUndefined();
      expect(tree.readContent('/bar/foo/foo.repository.ts')).toEqual('export class FooRepository {}\n');
    });
    it('should manage name and path', async () => {
      const options: RepositoryOptions = {
        name: 'foo',
        path: 'baz',
        flat: false,
        spec: false,
      };
      const tree: UnitTestTree = await runner.runSchematicAsync('repository', options).toPromise();
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === '/baz/foo/foo.repository.ts'),
      ).not.toBeUndefined();
      expect(tree.readContent('/baz/foo/foo.repository.ts')).toEqual('export class FooRepository {}\n');
    });
    it('should manage name to dasherize', async () => {
      const options: RepositoryOptions = {
        name: 'fooBar',
        flat: false,
        spec: false,
      };
      const tree: UnitTestTree = await runner.runSchematicAsync('repository', options).toPromise();
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === '/foo-bar/foo-bar.repository.ts'),
      ).not.toBeUndefined();
      expect(tree.readContent('/foo-bar/foo-bar.repository.ts')).toEqual('export class FooBarRepository {}\n');
    });
    it('should manage path to dasherize', async () => {
      const options: RepositoryOptions = {
        name: 'barBaz/foo',
        spec: false,
        flat: false,
      };
      const tree: UnitTestTree = await runner.runSchematicAsync('repository', options).toPromise();
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === '/bar-baz/foo/foo.repository.ts'),
      ).not.toBeUndefined();
      expect(tree.readContent('/bar-baz/foo/foo.repository.ts')).toEqual('export class FooRepository {}\n');
    });
    it('should manage javascript file', async () => {
      const options: RepositoryOptions = {
        name: 'foo',
        language: 'js',
        flat: false,
        spec: false,
      };
      const tree: UnitTestTree = await runner.runSchematicAsync('repository', options).toPromise();
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === '/foo/foo.repository.js'),
      ).not.toBeUndefined();
      expect(tree.readContent('/foo/foo.repository.js')).toEqual('export class FooRepository {}\n');
    });
  });
  