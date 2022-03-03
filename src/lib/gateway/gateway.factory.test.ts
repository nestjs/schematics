import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { GatewayOptions } from './gateway.schema';

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
    const tree: UnitTestTree = await runner
      .runSchematicAsync('gateway', options)
      .toPromise();
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
    const tree: UnitTestTree = await runner
      .runSchematicAsync('gateway', options)
      .toPromise();
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
    const tree: UnitTestTree = await runner
      .runSchematicAsync('gateway', options)
      .toPromise();
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
    const tree: UnitTestTree = await runner
      .runSchematicAsync('gateway', options)
      .toPromise();
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
  it('should keep backspaces', async () => {
    const options: GatewayOptions = {
      name: '_foo',
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('gateway', options)
      .toPromise();
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
    const tree: UnitTestTree = await runner
      .runSchematicAsync('gateway', options)
      .toPromise();
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
    const tree: UnitTestTree = await runner
      .runSchematicAsync('gateway', options)
      .toPromise();
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
});
