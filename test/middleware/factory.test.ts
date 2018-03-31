import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { MiddlewareOptions } from '../../src/middleware/schema';
import { InterceptorOptions } from '../../src/interceptor/schema';
import { ApplicationOptions } from '../../src/application/schema';

describe('Middleware Factory', () => {
  describe('Schematic definition', () => {
    context('Manage name only', () => {
      it('should generate a new guard file', () => {
        const options: MiddlewareOptions = {
          name: 'foo'
        };
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        const tree: UnitTestTree = runner.runSchematic('middleware', options, root);
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/foo/foo.middleware.ts'))
          .to.not.be.undefined;
      });
    });
    context('Manage name as a path', () => {
      it('should generate a new guard file', () => {
        const options: MiddlewareOptions = {
          name: 'bar/foo'
        };
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        const tree: UnitTestTree = runner.runSchematic('middleware', options, root);
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/bar/foo/foo.middleware.ts'))
          .to.not.be.undefined;
      });
    });
    context('Manage name and path', () => {
      it('should generate a new guard file', () => {
        const options: MiddlewareOptions = {
          name: 'foo',
          path: 'bar'
        };
        const runner: SchematicTestRunner = new SchematicTestRunner(
          '.',
          path.join(process.cwd(), 'src/collection.json')
        );
        const appOptions: ApplicationOptions = {
          directory: '',
        };
        const root: UnitTestTree = runner.runSchematic('application', appOptions, new VirtualTree());
        const tree: UnitTestTree = runner.runSchematic('middleware', options, root);
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/bar/foo/foo.middleware.ts'))
          .to.not.be.undefined;
      });
    });
  });
});
