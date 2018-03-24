import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { MiddlewareOptions } from '../../src/middleware/schema';

describe('Middleware Factory', () => {
  const options: MiddlewareOptions = {
    name: 'name',
  };
  let tree: UnitTestTree;
  beforeEach(() => {
    const runner: SchematicTestRunner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
    tree = runner.runSchematic('middleware', options, new VirtualTree());
  });
  it('should generate a new middleware file', () => {
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
          filename === `/src/${ options.name }.middleware.ts`
      )
    ).to.not.be.undefined;
  });
  it('should generate the expected middleware file content', () => {
    expect(
      tree.readContent(`/src/${ options.name }.middleware.ts`)
    ).to.be.equal(
      'import { Middleware, NestMiddleware, ExpressMiddleware } from \'@nestjs/common\';\n' +
      '\n' +
      '@Middleware()\n' +
      'export class NameMiddleware implements NestMiddleware {\n' +
      '  resolve(...args: any[]): ExpressMiddleware {\n' +
      '    return (req, res, next) => {\n' +
      '      next();\n' +
      '    };\n' +
      '  }\n' +
      '}\n'
    );
  });
});
