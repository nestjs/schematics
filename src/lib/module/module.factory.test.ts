import { normalize } from '@angular-devkit/core';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ApplicationOptions } from '../application/application.schema';
import { ModuleOptions } from './module.schema';

describe('Module Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: ModuleOptions = {
      name: 'foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('module', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.module.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.module.ts')).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should manage name as a path', async () => {
    const options: ModuleOptions = {
      name: 'bar/foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('module', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.module.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.module.ts')).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should manage name and path', async () => {
    const options: ModuleOptions = {
      name: 'foo',
      path: 'bar',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('module', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.module.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.module.ts')).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should manage name to normalize', async () => {
    const options: ModuleOptions = {
      name: 'fooBar',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('module', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar/foo-bar.module.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo-bar/foo-bar.module.ts')).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooBarModule {}\n',
    );
  });
  it('should manage name and path', async () => {
    const options: ModuleOptions = {
      name: 'foo',
      path: 'bar',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('module', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.module.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.module.ts')).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should not create a directory if "flat" is true', async () => {
    const options: ModuleOptions = {
      name: 'fooBar',
      skipImport: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('module', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar.module.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('foo-bar.module.ts')).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooBarModule {}\n',
    );
  });
  it('should manage path to normalize', async () => {
    const options: ModuleOptions = {
      name: 'barBaz/foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('module', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo/foo.module.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar-baz/foo/foo.module.ts')).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });
  it("should keep underscores in module's path and file name", async () => {
    const options: ModuleOptions = {
      name: '_bar/_foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('module', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_bar/_foo/_foo.module.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/_bar/_foo/_foo.module.ts')).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should manage javascript file', async () => {
    const options: ModuleOptions = {
      name: 'foo',
      skipImport: true,
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic('module', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.module.js'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.module.js')).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should manage declaration in app module', async () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = await runner.runSchematic('application', app);

    const options: ModuleOptions = {
      name: 'foo',
    };
    tree = await runner.runSchematic('module', options, tree);
    expect(tree.readContent(normalize('/src/app.module.ts'))).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { AppController } from './app.controller';\n" +
        "import { AppService } from './app.service';\n" +
        "import { FooModule } from './foo/foo.module';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [FooModule],\n' +
        '  controllers: [AppController],\n' +
        '  providers: [AppService],\n' +
        '})\n' +
        'export class AppModule {}\n',
    );
  });
  it('should manage declaration in bar module', async () => {
    const app: ApplicationOptions = {
      name: '',
    };
    let tree: UnitTestTree = await runner.runSchematic('application', app);

    const module: ModuleOptions = {
      name: 'bar',
    };
    tree = await runner.runSchematic('module', module, tree);
    const options: ModuleOptions = {
      name: 'bar/foo',
    };
    tree = await runner.runSchematic('module', options, tree);
    expect(tree.readContent(normalize('/src/bar/bar.module.ts'))).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { FooModule } from './foo/foo.module';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [FooModule]\n' +
        '})\n' +
        'export class BarModule {}\n',
    );
  });
});
