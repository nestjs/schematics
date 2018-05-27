import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { GatewayOptions } from '../../src/gateway/schema';

describe('Gateway Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: GatewayOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('gateway', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.gateway.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.gateway.ts')).toEqual(
      'import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse, } from \'@nestjs/websockets\';\n' +
      'import \'rxjs/add/observable/from\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@WebSocketGateway()\n' +
      'export class FooGateway {\n' +
      '  @WebSocketServer() server;\n' +
      '\n' +
      '  @SubscribeMessage()\n' +
      '  onEvent(): Observable<WsResponse<any>> {\n' +
      '    return Observable.from({});\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name as a path', () => {
    const options: GatewayOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('gateway', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.gateway.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar/foo/foo.gateway.ts')).toEqual(
      'import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse, } from \'@nestjs/websockets\';\n' +
      'import \'rxjs/add/observable/from\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@WebSocketGateway()\n' +
      'export class FooGateway {\n' +
      '  @WebSocketServer() server;\n' +
      '\n' +
      '  @SubscribeMessage()\n' +
      '  onEvent(): Observable<WsResponse<any>> {\n' +
      '    return Observable.from({});\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name and path', () => {
    const options: GatewayOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('gateway', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/baz/foo/foo.gateway.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/baz/foo/foo.gateway.ts')).toEqual(
      'import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse, } from \'@nestjs/websockets\';\n' +
      'import \'rxjs/add/observable/from\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@WebSocketGateway()\n' +
      'export class FooGateway {\n' +
      '  @WebSocketServer() server;\n' +
      '\n' +
      '  @SubscribeMessage()\n' +
      '  onEvent(): Observable<WsResponse<any>> {\n' +
      '    return Observable.from({});\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: GatewayOptions = {
      name: 'fooBar'
    };
    const tree: UnitTestTree = runner.runSchematic('gateway', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo-bar/foo-bar.gateway.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/foo-bar/foo-bar.gateway.ts')).toEqual(
      'import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse, } from \'@nestjs/websockets\';\n' +
      'import \'rxjs/add/observable/from\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@WebSocketGateway()\n' +
      'export class FooBarGateway {\n' +
      '  @WebSocketServer() server;\n' +
      '\n' +
      '  @SubscribeMessage()\n' +
      '  onEvent(): Observable<WsResponse<any>> {\n' +
      '    return Observable.from({});\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage path to dasherize', () => {
    const options: GatewayOptions = {
      name: 'barBaz/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('gateway', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-baz/foo/foo.gateway.ts')).not.toBeUndefined();
    expect(tree.readContent('/src/bar-baz/foo/foo.gateway.ts')).toEqual(
      'import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse, } from \'@nestjs/websockets\';\n' +
      'import \'rxjs/add/observable/from\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@WebSocketGateway()\n' +
      'export class FooGateway {\n' +
      '  @WebSocketServer() server;\n' +
      '\n' +
      '  @SubscribeMessage()\n' +
      '  onEvent(): Observable<WsResponse<any>> {\n' +
      '    return Observable.from({});\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage javascript file', () => {
    const options: GatewayOptions = {
      name: 'foo',
      language: 'js'
    };
    const tree: UnitTestTree = runner.runSchematic('gateway', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.gateway.js')).not.toBeUndefined();
    expect(tree.readContent('/src/foo/foo.gateway.js')).toEqual(
      'import { SubscribeMessage, WebSocketGateway, WebSocketServer, } from \'@nestjs/websockets\';\n' +
      'import \'rxjs/add/observable/from\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@WebSocketGateway()\n' +
      'export class FooGateway {\n' +
      '  @WebSocketServer() server;\n' +
      '\n' +
      '  @SubscribeMessage()\n' +
      '  onEvent() {\n' +
      '    return Observable.from({});\n' +
      '  }\n' +
      '}\n'
    );
  });
});
