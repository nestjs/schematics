import { normalize } from '@angular-devkit/core';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { ApplicationOptions } from '../application/application.schema.js';
import type { GatewayOptions } from './gateway.schema.js';

describe('Gateway Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: GatewayOptions = {
      name: 'foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('gateway', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.gateway.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.gateway.ts')).toEqual(
      "import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';\n" +
        '\n' +
        '@WebSocketGateway()\n' +
        'export class FooGateway {\n' +
        "  @SubscribeMessage('message')\n" +
        '  handleMessage(client: any, payload: any): string {\n' +
        "    return 'Hello world!';\n" +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage name as a path', async () => {
    const options: GatewayOptions = {
      name: 'bar/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('gateway', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.gateway.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar/foo/foo.gateway.ts')).toEqual(
      "import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';\n" +
        '\n' +
        '@WebSocketGateway()\n' +
        'export class FooGateway {\n' +
        "  @SubscribeMessage('message')\n" +
        '  handleMessage(client: any, payload: any): string {\n' +
        "    return 'Hello world!';\n" +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage name and path', async () => {
    const options: GatewayOptions = {
      name: 'foo',
      path: 'baz',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('gateway', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/baz/foo/foo.gateway.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/baz/foo/foo.gateway.ts')).toEqual(
      "import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';\n" +
        '\n' +
        '@WebSocketGateway()\n' +
        'export class FooGateway {\n' +
        "  @SubscribeMessage('message')\n" +
        '  handleMessage(client: any, payload: any): string {\n' +
        "    return 'Hello world!';\n" +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage name to normalize', async () => {
    const options: GatewayOptions = {
      name: 'fooBar',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('gateway', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar/foo-bar.gateway.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo-bar/foo-bar.gateway.ts')).toEqual(
      "import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';\n" +
        '\n' +
        '@WebSocketGateway()\n' +
        'export class FooBarGateway {\n' +
        "  @SubscribeMessage('message')\n" +
        '  handleMessage(client: any, payload: any): string {\n' +
        "    return 'Hello world!';\n" +
        '  }\n' +
        '}\n',
    );
  });
  it('should keep underscores', async () => {
    const options: GatewayOptions = {
      name: '_foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('gateway', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_foo/_foo.gateway.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/_foo/_foo.gateway.ts')).toEqual(
      "import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';\n" +
        '\n' +
        '@WebSocketGateway()\n' +
        'export class FooGateway {\n' +
        "  @SubscribeMessage('message')\n" +
        '  handleMessage(client: any, payload: any): string {\n' +
        "    return 'Hello world!';\n" +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage path to normalize', async () => {
    const options: GatewayOptions = {
      name: 'barBaz/foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('gateway', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo/foo.gateway.ts'),
    ).not.toBeUndefined();
    expect(tree.readContent('/bar-baz/foo/foo.gateway.ts')).toEqual(
      "import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';\n" +
        '\n' +
        '@WebSocketGateway()\n' +
        'export class FooGateway {\n' +
        "  @SubscribeMessage('message')\n" +
        '  handleMessage(client: any, payload: any): string {\n' +
        "    return 'Hello world!';\n" +
        '  }\n' +
        '}\n',
    );
  });
  it('should manage javascript file', async () => {
    const options: GatewayOptions = {
      name: 'foo',
      language: 'js',
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic('gateway', options);

    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo/foo.gateway.js'),
    ).not.toBeUndefined();
    expect(tree.readContent('/foo/foo.gateway.js')).toEqual(
      "import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';\n" +
        '\n' +
        '@WebSocketGateway()\n' +
        'export class FooGateway {\n' +
        "  @SubscribeMessage('message')\n" +
        '  handleMessage(client, payload) {\n' +
        "    return 'Hello world!';\n" +
        '  }\n' +
        '}\n',
    );
  });
  it('should create a spec file', async () => {
    const options: GatewayOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('gateway', options);

    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.gateway.spec.ts'),
    ).toBeDefined();
  });
  it('should create a spec file with custom file suffix', async () => {
    const options: GatewayOptions = {
      name: 'foo',
      spec: true,
      specFileSuffix: 'test',
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematic('gateway', options);

    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.gateway.spec.ts'),
    ).toBeUndefined();
    expect(
      files.find((filename) => filename === '/foo.gateway.test.ts'),
    ).toBeDefined();
  });
  it('should manage declaration in app module with .js extension for ESM projects', async () => {
    const app: ApplicationOptions = {
      name: '',
      type: 'esm',
    };
    let tree: UnitTestTree = await runner.runSchematic('application', app);

    const options: GatewayOptions = {
      name: 'foo',
    };
    tree = await runner.runSchematic('gateway', options, tree);
    expect(tree.readContent(normalize('/src/app.module.ts'))).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { AppController } from './app.controller.js';\n" +
        "import { AppService } from './app.service.js';\n" +
        "import { FooGateway } from './foo.gateway.js';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [],\n' +
        '  controllers: [AppController],\n' +
        '  providers: [AppService, FooGateway],\n' +
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

    const options: GatewayOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    };
    tree = await runner.runSchematic('gateway', options, tree);
    expect(tree.readContent('/src/foo.gateway.spec.ts')).toEqual(
      "import { Test, TestingModule } from '@nestjs/testing';\n" +
        "import { FooGateway } from './foo.gateway.js';\n" +
        '\n' +
        "describe('FooGateway', () => {\n" +
        '  let gateway: FooGateway;\n' +
        '\n' +
        '  beforeEach(async () => {\n' +
        '    const module: TestingModule = await Test.createTestingModule({\n' +
        '      providers: [FooGateway],\n' +
        '    }).compile();\n' +
        '\n' +
        '    gateway = module.get<FooGateway>(FooGateway);\n' +
        '  });\n' +
        '\n' +
        "  it('should be defined', () => {\n" +
        '    expect(gateway).toBeDefined();\n' +
        '  });\n' +
        '});\n',
    );
  });
});
