import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';

export interface InterceptorOptions {
  extension: string;
  name: string;
  path: string;
  rootDir: string;
}

describe('Interceptor Factory', () => {
  const options: InterceptorOptions = {
    extension: 'ts',
    name: 'name',
    path: 'path',
    rootDir: 'src/modules'
  };
  let runner: SchematicTestRunner;
  beforeEach(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('should generate a new interceptor file', () => {
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/${ options.rootDir }/${ options.path }/${ options.name }.interceptor.${ options.extension }`
      )
    ).to.not.be.undefined;
  });
  it('should generate the expected interceptor file content', () => {
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    expect(
      tree.readContent(`/${ options.rootDir }/${ options.path }/${ options.name }.interceptor.${ options.extension }`)
    ).to.be.equal(
      'import { Interceptor, NestInterceptor, ExecutionContext } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@Interceptor()\n' +
      'export class NameInterceptor implements NestInterceptor {\n' +
      '  intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {\n' +
      '    return undefined;\n' +
      '  }\n' +
      '}\n'
    );
  });
});
