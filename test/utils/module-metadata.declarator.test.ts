import { normalize } from '@angular-devkit/core';
import { expect } from 'chai';
import { ModuleMetadataDeclarator } from '../../src/utils/module-metadata.declarator';
import { DeclarationOptions } from '../../src/utils/module.declarator';

describe('Module Metadata Declarator', () => {
  let declarator: ModuleMetadataDeclarator;
  before(() => declarator = new ModuleMetadataDeclarator());
  it('should create the metadata if not exist when declare', () => {
    const content: string =
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule'
    };
    expect(declarator.declare(content, options)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BarModule\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should update the metadata if exist when declare', () => {
    const content =
      'import { Module } from \'@nestjs/common\';\n' +
      'import { BazModule } from \'./baz/baz.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BazModule' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule'
    };
    expect(declarator.declare(content, options)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { BazModule } from \'./baz/baz.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BazModule,\n' +
      '    BarModule\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
});
