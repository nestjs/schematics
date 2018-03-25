import { normalize } from '@angular-devkit/core';
import { expect } from 'chai';
import { DeclarationOptions } from '../../src/utils/module.declarator';
import { ModuleImportDeclarator } from '../../src/utils/module-import.declarator';

describe('Module Import Declarator', () => {
  it('should add import to the buffered module content', () => {
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
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { BarModule } from \'./bar/bar.module\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
  });
});
