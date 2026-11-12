import { normalize } from '@angular-devkit/core';
import * as ts from 'typescript';
import { ModuleImportDeclarator } from '../../src/utils/module-import.declarator.js';
import { ModuleMetadataDeclarator } from '../../src/utils/module-metadata.declarator.js';
import {
  DeclarationOptions,
  ModuleDeclarator,
} from '../../src/utils/module.declarator.js';
import { compileAndCaptureProviders } from '../helpers/module-import.js';

const options: DeclarationOptions = {
  metadata: 'providers',
  name: 'users',
  type: 'service',
  path: normalize('/src/users'),
  module: normalize('/src/app.module.ts'),
  symbol: 'UsersService',
};
const nestImport = "import { Module } from '@nestjs/common';\n";
const moduleBody = '@Module({ providers: [] })\nexport class AppModule {}\n';
const matchingImport =
  "import { UsersService } from './users/users.service';\n";
const aliasImport =
  "import { UsersService as Existing } from './users/users.service';\n";
function serviceImports(content: string): ts.ImportDeclaration[] {
  const source = ts.createSourceFile(
    'app.module.ts',
    content,
    ts.ScriptTarget.Latest,
  );
  return source.statements
    .filter(ts.isImportDeclaration)
    .filter(
      (node) =>
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text.startsWith('./users/users.service'),
    );
}
function expectGeneratedProvider(content: string): void {
  const { providers, generatedService } = compileAndCaptureProviders(content);
  expect(providers).toEqual([generatedService]);
}

describe('Module import compatibility', () => {
  it('preserves direct declare/metadata composition with an existing alias', () => {
    const imported = new ModuleImportDeclarator().declare(
      nestImport + aliasImport + moduleBody,
      options,
    );
    expect(imported).toContain(matchingImport.trim());
    const result = new ModuleMetadataDeclarator().declare(imported, options);
    expectGeneratedProvider(result);
  });

  it('preserves the requested local name in the legacy declare API', () => {
    const result = new ModuleImportDeclarator().declare(
      nestImport +
        "import { Other as UsersService } from './other';\n" +
        moduleBody,
      options,
    );
    expect(result).toContain(matchingImport.trim());
  });

  it('calls an injected subclass override of declare', () => {
    let calls = 0;
    class CustomImports extends ModuleImportDeclarator {
      override declare(content: string, opts: DeclarationOptions): string {
        calls++;
        return super.declare(content, opts);
      }
    }
    const result = new ModuleDeclarator(new CustomImports()).declare(
      nestImport + aliasImport + moduleBody,
      options,
    );
    expect(calls).toBe(1);
    expectGeneratedProvider(result);
  });

  it('supports an injected implementation exposing only declare', () => {
    let calls = 0;
    const imports = {
      declare(content: string): string {
        calls++;
        return matchingImport + content;
      },
    };
    const result = new ModuleDeclarator(imports).declare(
      nestImport + moduleBody,
      options,
    );
    expect(calls).toBe(1);
    expectGeneratedProvider(result);
  });

  it.each([
    'function unrelated() { const UsersService = 1; }',
    'function unrelated(UsersService: unknown) {}',
    'function unrelated({ UsersService }: { UsersService: unknown }) {}',
    'try {} catch (UsersService) {}',
    'function unrelated<UsersService>() {}',
    '{ const UsersService = 1; }',
    'function unrelated() { if (true) { var UsersService = 1; } }',
    'const unrelated = function UsersService() {};',
    'const unrelated = class UsersService {};',
    'namespace Unrelated { export const UsersService = 1; }',
    'namespace Space.UsersService {}',
    'class Unrelated { static { var UsersService = 1; } }',
    'const referenced = UsersService;',
    'const { UsersService: unrelated } = { UsersService: 1 };',
  ])('ignores unrelated scopes when reusing an import: %s', (unrelated) => {
    const content =
      nestImport +
      matchingImport +
      unrelated +
      '\n' +
      moduleBody.replace('[]', '[UsersService]');
    const result = new ModuleDeclarator().declare(content, options);
    expect(result).toBe(content);
    expectGeneratedProvider(result);
  });

  it('does not alias a fresh import for an unrelated same-named local', () => {
    const content =
      nestImport +
      'function unrelated() { const UsersService = 1; }\n' +
      moduleBody;
    const result = new ModuleDeclarator().declare(content, options);
    expect(result).toContain(matchingImport.trim());
    expectGeneratedProvider(result);
  });

  it('reuses an alias that is shadowed only in an unrelated function', () => {
    const content =
      nestImport +
      aliasImport +
      'function unrelated(Existing: unknown) {}\n' +
      moduleBody.replace('[]', '[Existing]');
    expect(new ModuleDeclarator().declare(content, options)).toBe(content);
    expectGeneratedProvider(content);
  });

  it('does not reserve an alias occupied only in an unrelated function', () => {
    const content =
      nestImport +
      "import { Other as UsersService } from './other';\n" +
      'function unrelated() { const UsersService_1 = UsersService; }\n' +
      moduleBody;
    const result = new ModuleDeclarator().declare(content, options);
    expect(result).toContain('UsersService as UsersService_1');
    expectGeneratedProvider(result);
  });

  it.each([
    'function setup<UsersService>() { BODY }\nsetup();',
    'function setup() { type UsersService = unknown; BODY }\nsetup();',
    'function setup() { interface UsersService {} BODY }\nsetup();',
    'class Container<UsersService> { setup() { BODY } }\nnew Container().setup();',
  ])(
    'reuses a value import through an enclosing type-only name: %s',
    (scope) => {
      const content =
        nestImport +
        matchingImport +
        scope.replace(
          'BODY',
          '@Module({ providers: [UsersService] }) class AppModule {}',
        );
      const result = new ModuleDeclarator().declare(content, options);
      expect(result).toBe(content);
      expectGeneratedProvider(result);
    },
  );

  it.each([
    ['function setup(Existing: unknown) { BODY }\nsetup(OtherService);'],
    [
      'function setup({ Existing }: { Existing: unknown }) { BODY }\nsetup({ Existing: OtherService });',
    ],
    ['try { throw OtherService; } catch (Existing) { BODY }'],
    ['function setup() { { var Existing = OtherService; } BODY }\nsetup();'],
    ['function setup() { { const Existing = OtherService; BODY } }\nsetup();'],
    ['for (const Existing of [OtherService]) { BODY }'],
    ['function setup() { BODY; const Existing = OtherService; }\nsetup();'],
    [
      'function setup() { const { value: Existing } = { value: OtherService }; BODY }\nsetup();',
    ],
    [
      'function setup() { const [, Existing] = [null, OtherService]; BODY }\nsetup();',
    ],
    [
      'try { throw { Existing: OtherService }; } catch ({ Existing }: any) { BODY }',
    ],
  ])('does not reuse a shadowed alias in an enclosing scope: %s', (scope) => {
    const content =
      nestImport +
      aliasImport +
      "import { OtherService } from './other';\n" +
      scope.replace('BODY', '@Module({ providers: [] }) class AppModule {}');
    const declarator = new ModuleDeclarator();
    const result = declarator.declare(content, options);
    expectGeneratedProvider(result);
    expect(declarator.declare(result, options)).toBe(result);
  });

  it('accounts for module-scoped var hoisted out of a block', () => {
    const result = new ModuleDeclarator().declare(
      nestImport +
        "import { OtherService } from './other';\n" +
        '{ var UsersService = OtherService; }\n' +
        moduleBody,
      options,
    );
    expect(result).toContain('UsersService as UsersService_1');
    expectGeneratedProvider(result);
  });

  it('reuses an equivalent .js specifier without isEsm', () => {
    const content =
      nestImport +
      matchingImport.replace(".service'", ".service.js'") +
      moduleBody.replace('[]', '[UsersService]');
    const result = new ModuleDeclarator().declare(content, options);
    expect(result).toBe(content);
    expectGeneratedProvider(result);
  });

  it.each([
    './users/index.js',
    './legacy/users.service.js',
    './users/users.service.mjs',
  ])('does not normalize a different module %s', (path) => {
    const input =
      nestImport + `import { UsersService } from '${path}';\n` + moduleBody;
    const result = new ModuleDeclarator().declare(input, options);
    expect(result).toContain('UsersService as UsersService_1');
    expect(result).toContain('providers: [UsersService_1]');
    expect(
      serviceImports(result).some(
        (node) =>
          ts.isStringLiteral(node.moduleSpecifier) &&
          node.moduleSpecifier.text === './users/users.service',
      ),
    ).toBe(true);
  });

  it.each([
    '// eslint-disable-line no-unused-vars',
    '/* retain this comment */',
    '/* multiline\ncomment */',
  ])('preserves trailing import trivia: %s', (comment) => {
    const input = nestImport.trimEnd() + ' ' + comment + '\n' + moduleBody;
    const result = new ModuleDeclarator().declare(input, options);
    expect(result).toContain(
      nestImport.trimEnd() + ' ' + comment + '\n' + matchingImport.trim(),
    );
    expectGeneratedProvider(result);
  });

  it('inserts before a decorator when there are no existing imports', () => {
    const result = new ModuleImportDeclarator().declareWithSymbol(
      moduleBody,
      options,
    ).content;
    const imports = serviceImports(result);
    expect(imports).toHaveLength(1);
    expect(imports[0].end).toBeLessThan(result.indexOf('@Module'));
    const source = ts.createSourceFile(
      'app.module.ts',
      result,
      ts.ScriptTarget.Latest,
    );
    expect(source.statements.map((node) => node.kind)).toEqual([
      ts.SyntaxKind.ImportDeclaration,
      ts.SyntaxKind.ClassDeclaration,
    ]);
  });

  it('inserts before an unfinished import that swallows the following decorator', () => {
    const content = nestImport + 'import { Foo } from\n' + moduleBody;
    const result = new ModuleImportDeclarator().declareWithSymbol(
      content,
      options,
    ).content;
    const imports = serviceImports(result);
    expect(imports).toHaveLength(1);
    expect(imports[0].end).toBeLessThan(result.indexOf('import { Foo } from'));
    expect(result).toContain('import { Foo } from\n' + moduleBody);
  });

  it('does not swallow an import in a final line comment without a newline', () => {
    const result = new ModuleImportDeclarator().declareWithSymbol(
      '// preserved',
      options,
    ).content;
    expect(serviceImports(result)).toHaveLength(1);
    expect(result).toContain('// preserved\n');
  });

  it('inserts before an unfinished import even without a preceding valid import', () => {
    const content = 'import { Foo } from\n' + moduleBody;
    const result = new ModuleImportDeclarator().declareWithSymbol(
      content,
      options,
    ).content;
    expect(serviceImports(result)).toHaveLength(1);
    expect(serviceImports(result)[0].end).toBeLessThan(
      result.indexOf('import { Foo } from'),
    );
  });

  it('does not reuse an unterminated matching specifier', () => {
    const broken = "import { UsersService } from './users/users.service\n";
    const result = new ModuleImportDeclarator().declareWithSymbol(
      nestImport + broken + moduleBody,
      options,
    );
    const imports = serviceImports(result.content).filter(
      (node) =>
        ts.isStringLiteral(node.moduleSpecifier) &&
        !node.moduleSpecifier.isUnterminated,
    );
    expect(imports).toHaveLength(1);
    expect(imports[0].end).toBeLessThan(result.content.indexOf(broken));
    expect(result.symbol).toBe('UsersService_1');
  });

  it('retains CRLF lines and trailing suppression comments', () => {
    const input = nestImport.replace(
      '\n',
      ' // eslint-disable-line no-unused-vars',
    );
    const result = new ModuleImportDeclarator().declareWithSymbol(
      input + '\r\n' + moduleBody.replaceAll('\n', '\r\n'),
      options,
    ).content;
    expect(result).toContain(
      input + '\r\n' + matchingImport.replace('\n', '\r\n'),
    );
  });

  it.each([
    ['binary chains', `const value = ${Array(12000).fill('1').join(' + ')};\n`],
    ['call chains', `const value = root${'.next()'.repeat(6000)};\n`],
  ])('walks deep %s without overflowing', (_name, expression) => {
    const result = new ModuleDeclarator().declare(
      nestImport + expression + moduleBody,
      options,
    );
    expect(serviceImports(result)).toHaveLength(1);
    expect(result).toContain(expression);
    expect(result).toContain('providers: [UsersService]');
  });
});
