import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { AssetOptions } from '../../src/schemas';

describe('Middleware Factory', () => {
  const options: AssetOptions = {
    extension: 'ts',
    name: 'name',
    path: 'name',
    rootDir: 'src/modules'
  };
  let runner: SchematicTestRunner;
  beforeEach(() => {
    runner = new SchematicTestRunner(
      '.',
      path.join(process.cwd(), 'src/collection.json')
    );
  });
  it('should create a new middleware file', () => {
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(
      files.find((filename) =>
          filename === `/${ options.rootDir }/${ options.path }/${ options.name }.middleware.${ options.extension }`
      )
    ).to.not.be.undefined;
  });
  it('should create the expected middleware file content', () => {
    const tree: UnitTestTree = runner.runSchematic('middleware', options, new VirtualTree());
    expect(
      tree.readContent(`/${ options.rootDir }/${ options.path }/${ options.name }.middleware.${ options.extension }`)
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
