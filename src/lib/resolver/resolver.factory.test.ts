import { normalize } from '@angular-devkit/core';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { ApplicationOptions } from '../application/application.schema.js';
import type { ResolverOptions } from './resolver.schema.js';

describe('Resolver Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: ResolverOptions = {
      name: 'foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('resolver', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should manage name as a path', async () => {
    const options: ResolverOptions = {
      name: 'bar/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('resolver', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should manage name and path', async () => {
    const options: ResolverOptions = {
      name: 'foo',
      path: 'baz',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('resolver', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/foo/foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/baz/foo/foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should manage name to normalize', async () => {
    const options: ResolverOptions = {
      name: 'fooBar',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('resolver', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar/foo-bar.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo-bar/foo-bar.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooBarResolver {}\n',
    );
  });
  it('should manage path to normalize', async () => {
    const options: ResolverOptions = {
      name: 'barBaz/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('resolver', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo/foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar-baz/foo/foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it("should keep underscores in resolver's path and file name", async () => {
    const options: ResolverOptions = {
      name: '_bar/_foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('resolver', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_bar/_foo/_foo.resolver.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/_bar/_foo/_foo.resolver.ts')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should manage javascript file', async () => {
    const options: ResolverOptions = {
      name: 'foo',
      language: 'js',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('resolver', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.resolver.js'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.resolver.js')).toEqual(
      "import { Resolver } from '@nestjs/graphql';\n" +
        '\n' +
        '@Resolver()\n' +
        'export class FooResolver {}\n',
    );
  });
  it('should create a spec file', async () => {
    const options: ResolverOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('resolver', options);

    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.resolver.spec.ts'),
    ).not.toBeUndefined();
  });
  it('should create a spec file with custom file suffix', async () => {
    const options: ResolverOptions = {
      name: 'foo',
      spec: true,
      specFileSuffix: 'test',
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('resolver', options);

    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.resolver.spec.ts'),
    ).toBeUndefined();
    expect(
      files.find((filename) => filename === '/foo.resolver.test.ts'),
    ).not.toBeUndefined();
  });
  it('should manage declaration in app module with .js extension for ESM projects', async () => {
    const app: ApplicationOptions = {
      name: '',
      type: 'esm',
    };
    let tree: UnitTestTree = await runner.runSchematic('application', app);

    const options: ResolverOptions = {
      name: 'foo',
    };
    tree = await runner.runSchematic('resolver', options, tree);
    expect(tree.readContent(normalize('/src/app.module.ts'))).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { AppController } from './app.controller.js';\n" +
        "import { AppService } from './app.service.js';\n" +
        "import { FooResolver } from './foo/foo.resolver.js';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [],\n' +
        '  controllers: [AppController],\n' +
        '  providers: [AppService, FooResolver],\n' +
        '})\n' +
        'export class AppModule {}\n',
    );
  });
  it('should generate spec file with .js import for ESM projects', async () => {
    const app: ApplicationOptions = {
      name: '',
      type: 'esm',
    };
    let tree: UnitTestTree = await runner.runSchematic('application', app);

    const options: ResolverOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    };
    tree = await runner.runSchematic('resolver', options, tree);
    expect(tree.readContent('/src/foo.resolver.spec.ts')).toEqual(
      "import { Test, TestingModule } from '@nestjs/testing';\n" +
        "import { FooResolver } from './foo.resolver.js';\n" +
        '\n' +
        "describe('FooResolver', () => {\n" +
        '  let resolver: FooResolver;\n' +
        '\n' +
        '  beforeEach(async () => {\n' +
        '    const module: TestingModule = await Test.createTestingModule({\n' +
        '      providers: [FooResolver],\n' +
        '    }).compile();\n' +
        '\n' +
        '    resolver = module.get<FooResolver>(FooResolver);\n' +
        '  });\n' +
        '\n' +
        "  it('should be defined', () => {\n" +
        '    expect(resolver).toBeDefined();\n' +
        '  });\n' +
        '});\n',
    );
  });
});
