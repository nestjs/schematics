import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { InterceptorOptions } from '../../src/interceptor/schema';

describe('Interceptor Factory', () => {
  const options: InterceptorOptions = {
    name: 'name',
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
        filename === `/src/${ options.name }.interceptor.ts`
      )
    ).to.not.be.undefined;
  });
  it('should generate the expected interceptor file content', () => {
    const tree: UnitTestTree = runner.runSchematic('interceptor', options, new VirtualTree());
    expect(
      tree.readContent(`/src/${ options.name }.interceptor.ts`)
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
