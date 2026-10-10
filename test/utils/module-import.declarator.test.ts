import { normalize } from '@angular-devkit/core';
import { ModuleImportDeclarator } from '../../src/utils/module-import.declarator.js';
import { DeclarationOptions } from '../../src/utils/module.declarator.js';

describe('Module Import Declarator', () => {
  it('should add import to the buffered module content', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo/bar'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { BarModule } from './bar/bar.module';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });

  it('should manage no type', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'providers',
      name: 'foo',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.ts'),
      symbol: 'Foo',
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { Foo } from './foo';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });

  it('should not break existing multi-line imports', () => {
    const content: string =
      'import {\n' +
      '  Module,\n' +
      '  Helper,\n' +
      "} from '@nestjs/common';\n" +
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
      symbol: 'BarModule',
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      'import {\n' +
        '  Module,\n' +
        '  Helper,\n' +
        "} from '@nestjs/common';\n" +
        "import { BarModule } from './bar/bar.module';\n" +
        '\n' +
        '@Helper()\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });

  it('should append .js extension for providers when isEsm is true', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'providers',
      name: 'foo',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.ts'),
      symbol: 'Foo',
      isEsm: true,
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { Foo } from './foo.js';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });

  it('should append .js extension for module imports when isEsm is true', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo/bar'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
      isEsm: true,
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { BarModule } from './bar/bar.module.js';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });

  describe('when the symbol is already imported', () => {
    const options: DeclarationOptions = {
      metadata: 'providers',
      type: 'service',
      name: 'users',
      path: normalize('/src/users'),
      module: normalize('/src/app.module.ts'),
      symbol: 'UsersService',
    };
    const moduleBody =
      '\n' +
      '@Module({ providers: [UsersService] })\n' +
      'export class AppModule {}\n';

    it('should not duplicate the import', () => {
      const content: string =
        "import { Module } from '@nestjs/common';\n" +
        "import { UsersService } from './users/users.service';\n" +
        moduleBody;
      const declarator = new ModuleImportDeclarator();
      expect(declarator.declare(content, options)).toEqual(content);
    });

    it('should not duplicate a double-quoted import', () => {
      const content: string =
        'import { Module } from "@nestjs/common";\n' +
        'import { UsersService } from "./users/users.service";\n' +
        moduleBody;
      const declarator = new ModuleImportDeclarator();
      expect(declarator.declare(content, options)).toEqual(content);
    });

    it('should not duplicate a multi-symbol import', () => {
      const content: string =
        "import { Module } from '@nestjs/common';\n" +
        "import { USERS, UsersService } from './users/users.service';\n" +
        moduleBody;
      const declarator = new ModuleImportDeclarator();
      expect(declarator.declare(content, options)).toEqual(content);
    });

    it('should not duplicate the import when isEsm is true', () => {
      const content: string =
        "import { Module } from '@nestjs/common';\n" +
        "import { UsersService } from './users/users.service.js';\n" +
        moduleBody;
      const declarator = new ModuleImportDeclarator();
      expect(declarator.declare(content, { ...options, isEsm: true })).toEqual(
        content,
      );
    });

    it('should still add the import for a similar symbol or another path', () => {
      const content: string =
        "import { Module } from '@nestjs/common';\n" +
        "import { AdminUsersService } from './users/users.service';\n" +
        "import { UsersService } from './legacy/users.service';\n" +
        moduleBody;
      const declarator = new ModuleImportDeclarator();
      expect(declarator.declare(content, options)).toEqual(
        "import { Module } from '@nestjs/common';\n" +
          "import { AdminUsersService } from './users/users.service';\n" +
          "import { UsersService } from './legacy/users.service';\n" +
          "import { UsersService } from './users/users.service';\n" +
          moduleBody,
      );
    });
  });

  it('should not break on match of "from" in another context', () => {
    const content: string =
      'import {\n' +
      '  Module,\n' +
      '  Helper,\n' +
      "} from '@nestjs/common';\n" +
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
      symbol: 'BarModule',
    };
    const declarator = new ModuleImportDeclarator();
    expect(declarator.declare(content, options)).toEqual(
      'import {\n' +
        '  Module,\n' +
        '  Helper,\n' +
        "} from '@nestjs/common';\n" +
        "import { BarModule } from './bar/bar.module';\n" +
        '\n' +
        '@Helper()\n' +
        '@Module({})\n' +
        'const x = " from ";\n' +
        'console.error(" from ");\n' +
        'export class FooModule {}\n',
    );
  });
});
