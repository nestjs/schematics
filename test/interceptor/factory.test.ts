import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { ApplicationOptions } from '../../src/application/schema';
import { InterceptorOptions } from '../../src/interceptor/schema';

describe('Interceptor Factory', () => {
  // const options: InterceptorOptions = {
  //   name: 'name',
  // };
  // let tree: UnitTestTree;
  // before(() => {
  //   const runner: SchematicTestRunner = new SchematicTestRunner(
  //     '.',
  //     path.join(process.cwd(), 'src/collection.json')
  //   );
  //   tree = runner.runSchematic('interceptor', options, new VirtualTree());
  // });
  // it('should generate a new interceptor file', () => {
  //   const files: string[] = tree.files;
  //   expect(
  //     files.find((filename) =>
  //       filename === `/src/${ options.name }.interceptor.ts`
  //     )
  //   ).to.not.be.undefined;
  // });
  // it('should generate the expected interceptor file content', () => {
  //   expect(
  //     tree.readContent(`/src/${ options.name }.interceptor.ts`)
  //   ).to.be.equal(
  //     'import { Interceptor, NestInterceptor, ExecutionContext } from \'@nestjs/common\';\n' +
  //     'import { Observable } from \'rxjs/Observable\';\n' +
  //     '\n' +
  //     '@Interceptor()\n' +
  //     'export class NameInterceptor implements NestInterceptor {\n' +
  //     '  intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {\n' +
  //     '    return undefined;\n' +
  //     '  }\n' +
  //     '}\n'
  //   );
  // });
  describe('Schematic definition', () => {
    context('Manage name only', () => {
      it('should generate a new guard file', () => {
        const options: InterceptorOptions = {
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
        const tree: UnitTestTree = runner.runSchematic('interceptor', options, root);
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/foo/foo.interceptor.ts'))
          .to.not.be.undefined;
      });
    });
    context('Manage name as a path', () => {
      it('should generate a new guard file', () => {
        const options: InterceptorOptions = {
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
        const tree: UnitTestTree = runner.runSchematic('interceptor', options, root);
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/bar/foo/foo.interceptor.ts'))
          .to.not.be.undefined;
      });
    });
    context('Manage name and path', () => {
      it('should generate a new guard file', () => {
        const options: InterceptorOptions = {
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
        const tree: UnitTestTree = runner.runSchematic('interceptor', options, root);
        const files: string[] = tree.files;
        expect(files.find((filename) => filename === '/src/bar/foo/foo.interceptor.ts'))
          .to.not.be.undefined;
      });
    });
  });
});
