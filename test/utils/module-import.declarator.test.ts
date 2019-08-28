import { normalize } from '@angular-devkit/core';
import { ModuleImportDeclarator } from '../../src/utils/module-import.declarator';
import { DeclarationOptions } from '../../src/utils/module.declarator';

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
      path: normalize('/src/foo/bar'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule'
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { BarModule } from \'./bar/bar.module\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
  });

  it('should manage no type', () => {
    const content: string =
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'providers',
      name: 'foo',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.ts'),
      symbol: 'Foo'
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { Foo } from \'./foo\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
  });

  it('should not break existing multi-line imports', () => {
    const content: string =
      'import {\n' +
      '  Module,\n' +
      '  Helper,\n' +
      '} from \'@nestjs/common\';\n' +
      '\n' +
      '@Helper()\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo/bar'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule'
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      'import {\n' +
      '  Module,\n' +
      '  Helper,\n' +
      '} from \'@nestjs/common\';\n' +
      'import { BarModule } from \'./bar/bar.module\';\n' +
      '\n' +
      '@Helper()\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
  });

  it('should not break on match of "from" in other contexts', () => {
    const content: string =
      'import {\n' +
      '  Module,\n' +
      '  Helper,\n' +
      '} from \'@nestjs/common\';\n' +
      '\n' +
      '@Helper()\n' +
      '@Module({})\n' +
      'const x = " from ";\n' +
      'console.error(" from ");\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo/bar'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule'
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      'import {\n' +
      '  Module,\n' +
      '  Helper,\n' +
      '} from \'@nestjs/common\';\n' +
      'import { BarModule } from \'./bar/bar.module\';\n' +
      '\n' +
      '@Helper()\n' +
      '@Module({})\n' +
      'const x = " from ";\n' +
      'console.error(" from ");\n' +
      'export class FooModule {}\n'
    );
  });
});
