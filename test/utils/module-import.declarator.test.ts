import { normalize } from '@angular-devkit/core';
import * as ts from 'typescript';
import { ModuleImportDeclarator } from '../../src/utils/module-import.declarator.js';
import {
  DeclarationOptions,
  ModuleDeclarator,
} from '../../src/utils/module.declarator.js';

function compileAndCaptureProviders(content: string): {
  generatedService: Function;
  providers: unknown[];
} {
  const files = new Map([
    ['/virtual/app.module.ts', content],
    [
      '/virtual/other.ts',
      'export class Other {}\nexport class OtherService {}\n',
    ],
    ['/virtual/users/users.service.ts', 'export class UsersService {}\n'],
    [
      '/virtual/nest-common.d.ts',
      "declare module '@nestjs/common' { export function Module(metadata: { providers: unknown[] }): ClassDecorator; }\n",
    ],
  ]);
  const options: ts.CompilerOptions = {
    experimentalDecorators: true,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const originalFileExists = host.fileExists.bind(host);
  const originalReadFile = host.readFile.bind(host);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.fileExists = (fileName) =>
    files.has(fileName) || originalFileExists(fileName);
  host.readFile = (fileName) =>
    files.get(fileName) ?? originalReadFile(fileName);
  host.getSourceFile = (
    fileName,
    languageVersion,
    onError,
    shouldCreateNew,
  ) => {
    const text = files.get(fileName);
    return text === undefined
      ? originalGetSourceFile(
          fileName,
          languageVersion,
          onError,
          shouldCreateNew,
        )
      : ts.createSourceFile(fileName, text, languageVersion);
  };
  host.resolveModuleNames = (moduleNames) =>
    moduleNames.map((moduleName) => {
      const fileName =
        moduleName === '@nestjs/common'
          ? '/virtual/nest-common.d.ts'
          : moduleName === './other'
            ? '/virtual/other.ts'
            : moduleName === './users/users.service'
              ? '/virtual/users/users.service.ts'
              : undefined;
      return fileName
        ? { resolvedFileName: fileName, extension: ts.Extension.Ts }
        : undefined;
    });
  const program = ts.createProgram([...files.keys()], options, host);
  expect(ts.getPreEmitDiagnostics(program)).toEqual([]);

  const generatedService = class GeneratedUsersService {};
  const other = class Other {};
  const otherService = class OtherService {};
  const emitted = ts.transpileModule(content, {
    compilerOptions: {
      experimentalDecorators: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  let providers: unknown[] = [];
  const requireModule = (specifier: string) => {
    if (specifier === '@nestjs/common') {
      return {
        Module: (metadata: { providers: unknown[] }) => {
          providers = metadata.providers;
          return (target: unknown) => target;
        },
      };
    }
    if (specifier === './users/users.service') {
      return { UsersService: generatedService };
    }
    if (specifier === './other') {
      return { Other: other, OtherService: otherService };
    }
    throw new Error(`Unexpected module: ${specifier}`);
  };
  new Function('require', 'exports', emitted)(requireModule, {});
  return { generatedService, providers };
}

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

  describe('existing import bindings', () => {
    const options: DeclarationOptions = {
      metadata: 'providers',
      name: 'users',
      type: 'service',
      path: normalize('/src/users'),
      module: normalize('/src/app.module.ts'),
      symbol: 'UsersService',
    };
    const moduleContent = (imports: string) =>
      `${imports}\n@Module({ providers: [UsersService] })\nexport class AppModule {}\n`;

    it('reuses the requested value import from the generated module', () => {
      const content = moduleContent(
        "import { UsersService } from './users/users.service';\n",
      );
      expect(new ModuleImportDeclarator().declare(content, options)).toBe(
        content,
      );
    });

    it('reuses a named value import in a multiline declaration with comments', () => {
      const content = moduleContent(
        "import {\n  /* service */ UsersService,\n  OtherService,\n} from './users/users.service';\n",
      );
      expect(new ModuleImportDeclarator().declare(content, options)).toBe(
        content,
      );
    });

    it('reuses the requested named import in a mixed default and named import', () => {
      const content = moduleContent(
        "import Other, { UsersService } from './users/users.service';\n",
      );
      expect(new ModuleImportDeclarator().declare(content, options)).toBe(
        content,
      );
    });

    it('registers an existing aliased import by its local name', () => {
      const content = moduleContent(
        "import { UsersService as LegacyUsers } from './users/users.service';\n",
      ).replace('providers: [UsersService]', 'providers: [LegacyUsers]');
      expect(new ModuleImportDeclarator().declare(content, options)).toBe(
        content,
      );
      expect(new ModuleDeclarator().declare(content, options)).toContain(
        'providers: [LegacyUsers]',
      );
    });

    it('registers a new alias when another import owns the requested local name', () => {
      const content =
        "import { Other as UsersService } from './other';\n" +
        '@Module({ providers: [] })\n' +
        'export class AppModule {}\n';
      const result = new ModuleDeclarator().declare(content, options);
      expect(result).toContain(
        "import { UsersService as UsersService_1 } from './users/users.service';",
      );
      expect(result).toContain('providers: [UsersService_1]');
    });

    it('chooses a free alias when the first alias is already bound', () => {
      const content =
        "import { Other as UsersService } from './other';\n" +
        'const UsersService_1 = Other;\n' +
        '@Module({ providers: [] })\n' +
        'export class AppModule {}\n';
      const result = new ModuleDeclarator().declare(content, options);
      expect(result).toContain(
        "import { UsersService as UsersService_2 } from './users/users.service';",
      );
      expect(result).toContain('providers: [UsersService_2]');
    });

    it('avoids aliases occupied by var declarations in top-level blocks', () => {
      const content =
        'if (enabled) { var UsersService_1 = ExistingService; }\n' +
        'const UsersService = ExistingService;\n' +
        '@Module({ providers: [] })\n' +
        'export class AppModule {}\n';
      const result = new ModuleDeclarator().declare(content, options);
      expect(result).toContain(
        "import { UsersService as UsersService_2 } from './users/users.service';",
      );
      expect(result).toContain('providers: [UsersService_2]');
    });

    it('inserts a real import outside a multiline block comment', () => {
      const content = new ModuleDeclarator().declare(
        "import { Module } from '@nestjs/common';\n" +
          '\n/*\n' +
          "import { Unrelated } from './fake';\n" +
          '*/\n\n' +
          '@Module({ providers: [] })\n' +
          'export class AppModule {}\n',
        options,
      );
      const source = ts.createSourceFile(
        'app.module.ts',
        content,
        ts.ScriptTarget.Latest,
      );
      const serviceImports = source.statements.filter(
        (statement) =>
          ts.isImportDeclaration(statement) &&
          ts.isStringLiteral(statement.moduleSpecifier) &&
          statement.moduleSpecifier.text === './users/users.service',
      );
      expect(serviceImports).toHaveLength(1);
      const { generatedService, providers } =
        compileAndCaptureProviders(content);
      expect(providers).toEqual([generatedService]);
    });

    it('does not treat a commented out import as a binding', () => {
      const content = moduleContent(
        "/* import { UsersService } from './users/users.service'; */\n",
      );
      expect(new ModuleImportDeclarator().declare(content, options)).toContain(
        "import { UsersService } from './users/users.service';",
      );
    });

    it.each([
      ["import { Other as UsersService } from './other';\n", 'aliased import'],
      [
        "import { UsersService } from './legacy/users.service';\n",
        'different module',
      ],
      ["import { UsersService } from './users/index';\n", 'barrel module'],
      [
        "import type { UsersService } from './users/users.service';\n",
        'type-only import',
      ],
      [
        "import { type UsersService } from './users/users.service';\n",
        'type-only specifier',
      ],
      [
        "import type Default, { UsersService } from './users/users.service';\n",
        'type-only mixed import',
      ],
      ["import UsersService from './users/users.service';\n", 'default import'],
      [
        "import * as UsersService from './users/users.service';\n",
        'namespace import',
      ],
      ['class UsersService {}\n', 'local declaration'],
      ['const UsersService = ExistingService;\n', 'variable declaration'],
      [
        'if (enabled) { var UsersService = ExistingService; }\n',
        'function-scoped variable declaration',
      ],
      ['function UsersService() {}\n', 'function declaration'],
      ['type UsersService = ExistingService;\n', 'type alias declaration'],
      ['interface UsersService {}\n', 'interface declaration'],
      [
        "import UsersService = require('./users/users.service');\n",
        'import equals declaration',
      ],
    ])('uses a unique alias for conflicting binding %s', (binding) => {
      const content = moduleContent(binding);
      expect(new ModuleImportDeclarator().declare(content, options)).toContain(
        "import { UsersService as UsersService_1 } from './users/users.service';",
      );
    });

    it('recognizes a .js ESM specifier as the requested import', () => {
      const content = moduleContent(
        "import { UsersService } from './users/users.service.js';\n",
      );
      expect(
        new ModuleImportDeclarator().declare(content, {
          ...options,
          isEsm: true,
        }),
      ).toBe(content);
    });

    it('does not rewrite shorthand metadata while reusing its import', () => {
      const content =
        "import { UsersService } from './users/users.service';\n" +
        'const providers = [];\n' +
        '@Module({ providers })\n' +
        'export class AppModule {}\n';
      expect(new ModuleDeclarator().declare(content, options)).toBe(content);
    });

    it('preserves metadata that already contains the generated symbol', () => {
      const content =
        "import { UsersService } from './users/users.service';\n" +
        '@Module({ providers: [UsersService] })\n' +
        'export class AppModule {}\n';
      expect(new ModuleDeclarator().declare(content, options)).toBe(content);
    });

    it('adds the generated symbol when existing metadata does not contain it', () => {
      const content =
        "import { OtherService } from './other.service';\n" +
        '@Module({ providers: [OtherService] })\n' +
        'export class AppModule {}\n';
      const result = new ModuleDeclarator().declare(content, options);
      expect(result).toContain(
        "import { UsersService } from './users/users.service';",
      );
      expect(result).toContain('providers: [OtherService, UsersService]');
    });

    it('does not let a nested declaration shadow a newly generated alias', () => {
      const content = new ModuleDeclarator().declare(
        "import { Module } from '@nestjs/common';\n" +
          "import { Other as UsersService } from './other';\n" +
          'function setup() {\n' +
          '  const UsersService_1 = UsersService;\n' +
          '  @Module({ providers: [] })\n' +
          '  class AppModule {}\n' +
          '  return AppModule;\n' +
          '}\n' +
          'setup();\n',
        options,
      );

      const { generatedService, providers } =
        compileAndCaptureProviders(content);
      expect(providers).toEqual([generatedService]);
    });

    it('does not reuse an imported alias shadowed at the target decorator', () => {
      const content = new ModuleDeclarator().declare(
        "import { Module } from '@nestjs/common';\n" +
          "import { UsersService as Existing } from './users/users.service';\n" +
          "import { OtherService } from './other';\n" +
          'function setup() {\n' +
          '  const Existing = OtherService;\n' +
          '  @Module({ providers: [] })\n' +
          '  class AppModule {}\n' +
          '  return AppModule;\n' +
          '}\n' +
          'setup();\n',
        options,
      );

      const { generatedService, providers } =
        compileAndCaptureProviders(content);
      expect(providers).toEqual([generatedService]);
    });

    it.each([
      [
        'a shadowed parameter',
        'function setup(UsersService_1: typeof UsersService) {\n' +
          '  @Module({ providers: [] }) class AppModule {}\n' +
          '}\n' +
          'setup(UsersService);\n',
      ],
      [
        'a destructured parameter',
        'function setup({ UsersService_1 }: { UsersService_1: typeof UsersService }) {\n' +
          '  @Module({ providers: [] }) class AppModule {}\n' +
          '}\n' +
          'setup({ UsersService_1: UsersService });\n',
      ],
      [
        'a nested block declaration',
        'function setup() {\n' +
          '  {\n' +
          '    const UsersService_1 = UsersService;\n' +
          '    @Module({ providers: [] }) class AppModule {}\n' +
          '  }\n' +
          '}\n' +
          'setup();\n',
      ],
      [
        'a nested function declaration',
        'function setup() {\n' +
          '  function register() {\n' +
          '    const UsersService_1 = UsersService;\n' +
          '    @Module({ providers: [] }) class AppModule {}\n' +
          '  }\n' +
          '  register();\n' +
          '}\n' +
          'setup();\n',
      ],
    ])('avoids alias shadowing by %s at the decorator', (_case, scope) => {
      const content = new ModuleDeclarator().declare(
        "import { Module } from '@nestjs/common';\n" +
          "import { Other as UsersService } from './other';\n" +
          scope,
        options,
      );

      expect(content).toContain(
        "import { UsersService as UsersService_2 } from './users/users.service';",
      );
      const { generatedService, providers } =
        compileAndCaptureProviders(content);
      expect(providers).toEqual([generatedService]);
    });

    it('uses an unshadowed matching alias when another alias is shadowed', () => {
      const content = new ModuleDeclarator().declare(
        "import { Module } from '@nestjs/common';\n" +
          "import { UsersService as Unsafe } from './users/users.service';\n" +
          "import { UsersService as Safe } from './users/users.service';\n" +
          "import { OtherService } from './other';\n" +
          'function setup() {\n' +
          '  const Unsafe = OtherService;\n' +
          '  @Module({ providers: [] }) class AppModule {}\n' +
          '}\n' +
          'setup();\n',
        options,
      );

      expect(content).toContain('providers: [Safe]');
      expect(content).not.toContain('providers: [Unsafe]');
      const { generatedService, providers } =
        compileAndCaptureProviders(content);
      expect(providers).toEqual([generatedService]);
    });

    it('does not alias for unrelated nested declarations', () => {
      const content = new ModuleDeclarator().declare(
        "import { Module } from '@nestjs/common';\n" +
          "import { OtherService } from './other';\n" +
          'function setup() {\n' +
          '  const Unrelated = OtherService;\n' +
          '  @Module({ providers: [] }) class AppModule {}\n' +
          '}\n' +
          'setup();\n',
        options,
      );

      expect(content).toContain(
        "import { UsersService } from './users/users.service';",
      );
      expect(content).toContain('providers: [UsersService]');
      const { generatedService, providers } =
        compileAndCaptureProviders(content);
      expect(providers).toEqual([generatedService]);
    });

    it('is idempotent when an existing imported alias is shadowed', () => {
      const content =
        "import { UsersService as Existing } from './users/users.service';\n" +
        'function setup() {\n' +
        '  const Existing = OtherService;\n' +
        '  @Module({ providers: [] }) class AppModule {}\n' +
        '}\n';
      const declarator = new ModuleDeclarator();
      const once = declarator.declare(content, options);

      expect(declarator.declare(once, options)).toBe(once);
    });

    it('executes a conflicting module and registers the generated service class through its alias', () => {
      const content = new ModuleDeclarator().declare(
        "import { Module } from '@nestjs/common';\n" +
          "import { Other as UsersService } from './other';\n" +
          '@Module({})\n' +
          'export class AppModule {}\n',
        options,
      );
      const virtualFiles = new Map([
        ['/virtual/app.module.ts', content],
        ['/virtual/other.ts', 'export class Other {}\n'],
        ['/virtual/users/users.service.ts', 'export class UsersService {}\n'],
        [
          '/virtual/nest-common.d.ts',
          "declare module '@nestjs/common' { export function Module(metadata: { providers: unknown[] }): ClassDecorator; }\n",
        ],
      ]);
      const compilerOptions: ts.CompilerOptions = {
        experimentalDecorators: true,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        noEmit: true,
        strict: true,
        target: ts.ScriptTarget.ES2022,
        types: [],
      };
      const host = ts.createCompilerHost(compilerOptions);
      const originalFileExists = host.fileExists.bind(host);
      const originalReadFile = host.readFile.bind(host);
      const originalGetSourceFile = host.getSourceFile.bind(host);
      host.fileExists = (fileName) =>
        virtualFiles.has(fileName) || originalFileExists(fileName);
      host.readFile = (fileName) =>
        virtualFiles.get(fileName) ?? originalReadFile(fileName);
      host.getSourceFile = (
        fileName,
        languageVersion,
        onError,
        shouldCreateNew,
      ) => {
        const text = virtualFiles.get(fileName);
        return text === undefined
          ? originalGetSourceFile(
              fileName,
              languageVersion,
              onError,
              shouldCreateNew,
            )
          : ts.createSourceFile(fileName, text, languageVersion);
      };
      host.resolveModuleNames = (moduleNames) =>
        moduleNames.map((moduleName) => {
          const fileName =
            moduleName === '@nestjs/common'
              ? '/virtual/nest-common.d.ts'
              : moduleName === './other'
                ? '/virtual/other.ts'
                : moduleName === './users/users.service'
                  ? '/virtual/users/users.service.ts'
                  : undefined;
          return fileName
            ? { resolvedFileName: fileName, extension: ts.Extension.Ts }
            : undefined;
        });
      const program = ts.createProgram(
        [...virtualFiles.keys()],
        compilerOptions,
        host,
      );
      expect(ts.getPreEmitDiagnostics(program)).toEqual([]);
      const emitted = ts.transpileModule(content, {
        compilerOptions: {
          experimentalDecorators: true,
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText;
      class GeneratedUsersService {}
      class ExistingUsersService {}
      let registeredProviders: unknown[] = [];
      const requireModule = (specifier: string) => {
        if (specifier === '@nestjs/common') {
          return {
            Module: (metadata: { providers: unknown[] }) => {
              registeredProviders = metadata.providers;
              return (target: unknown) => target;
            },
          };
        }
        if (specifier === './users/users.service') {
          return { UsersService: GeneratedUsersService };
        }
        if (specifier === './other') {
          return { Other: ExistingUsersService };
        }
        throw new Error(`Unexpected module: ${specifier}`);
      };
      const execute = new Function('require', 'exports', emitted);
      execute(requireModule, {});
      expect(registeredProviders).toEqual([GeneratedUsersService]);
    });

    it('is idempotent when the generated declaration is inserted repeatedly', () => {
      const content =
        "import { Module } from '@nestjs/common';\n" +
        '@Module({})\n' +
        'export class AppModule {}\n';
      const declarator = new ModuleDeclarator();
      const once = declarator.declare(content, options);
      expect(declarator.declare(once, options)).toBe(once);
    });

    it('is idempotent when the generated import uses a collision alias', () => {
      const content =
        "import { Other as UsersService } from './other';\n" +
        '@Module({})\n' +
        'export class AppModule {}\n';
      const declarator = new ModuleDeclarator();
      const once = declarator.declare(content, options);
      expect(once).toContain(
        "import { UsersService as UsersService_1 } from './users/users.service';",
      );
      expect(once).toContain('providers: [UsersService_1]');
      expect(declarator.declare(once, options)).toBe(once);
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
