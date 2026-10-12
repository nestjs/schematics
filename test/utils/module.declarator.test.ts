import { normalize } from '@angular-devkit/core';
import { DeclarationOptions, ModuleDeclarator } from '../../src/utils/module.declarator.js';

describe('Module Declarator', () => {
  it('should import the original symbol and register it when an aliased import exists', () => {
    const imports =
      "import { Module } from '@nestjs/common';\n" +
      "import { UsersService as LegacyUsers } from './users/users.service';\n";
    const content =
      imports +
      '\n' +
      '@Module({ providers: [LegacyUsers] })\n' +
      'export class AppModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'providers',
      type: 'service',
      name: 'users',
      path: normalize('/src/users'),
      module: normalize('/src/app.module.ts'),
    };

    expect(new ModuleDeclarator().declare(content, options)).toEqual(
      imports +
        "import { UsersService } from './users/users.service';\n" +
        '\n' +
        '@Module({ providers: [LegacyUsers, UsersService] })\n' +
        'export class AppModule {}\n',
    );
  });

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
