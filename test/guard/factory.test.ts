import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { GuardOptions } from '../../src/guard/schema';

describe('Guard Factory', () => {
  const options: GuardOptions = {
    name: 'name',
  };
  let runner: SchematicTestRunner;
  before(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('should generate a new guard file', () => {
    const tree: UnitTestTree = runner.runSchematic('guard', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
        filename === `/src/${ options.name }.guard.ts`
      )
    ).to.not.be.undefined;
  });
  it('should generate the expected guard file content', () => {
    const tree: UnitTestTree = runner.runSchematic('guard', options, new VirtualTree());
    expect(
      tree.readContent(`/src/${ options.name }.guard.ts`)
    ).to.be.equal(
      'import { Guard, CanActivate, ExecutionContext } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@Guard()\n' +
      'export class NameGuard implements CanActivate {\n' +
      '  canActivate(dataOrRequest, context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {\n' +
      '    return true;\n' +
      '  }\n' +
      '}\n'
    );
  });
});
