import { normalize } from '@angular-devkit/core';
import { DeclarationOptions, ModuleDeclarator } from '../../src/utils/module.declarator';

describe('Module Declarator', () => {
  it('should add module declaration when declare', () => {
    const content: string =
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const declarator = new ModuleDeclarator();
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo/bar'),
      module: normalize('/src/foo/foo.module.ts')
    };
    expect(declarator.declare(content, options)).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { BarModule } from \'./bar/bar.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [BarModule]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage no type', () => {
    const content: string =
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const declarator = new ModuleDeclarator();
    const options: DeclarationOptions = {
      metadata: 'providers',
      name: 'foo',
      path: normalize('/src/foo'),
      module: normalize('/src/foo.ts')
    };
    expect(declarator.declare(content, options)).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { Foo } from \'./foo/foo\';\n' +
      '\n' +
      '@Module({\n' +
      '  providers: [Foo]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
});
