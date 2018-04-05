import { VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';
import * as path from 'path';
import { GuardOptions } from '../../src/guard/schema';

describe('Guard Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: GuardOptions = {
      name: 'foo'
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo/foo.guard.ts')).to.not.be.undefined;
    expect(tree.readContent('/src/foo/foo.guard.ts')).to.be.equal(
      'import { Guard, CanActivate, ExecutionContext } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@Guard()\n' +
      'export class FooGuard implements CanActivate {\n' +
      '  canActivate(dataOrRequest, context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {\n' +
      '    return true;\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name as a path', () => {
    const options: GuardOptions = {
      name: 'bar/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar/foo/foo.guard.ts')).to.not.be.undefined;
    expect(tree.readContent('/src/bar/foo/foo.guard.ts')).to.be.equal(
      'import { Guard, CanActivate, ExecutionContext } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@Guard()\n' +
      'export class FooGuard implements CanActivate {\n' +
      '  canActivate(dataOrRequest, context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {\n' +
      '    return true;\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name and path', () => {
    const options: GuardOptions = {
      name: 'foo',
      path: 'baz'
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/baz/foo/foo.guard.ts')).to.not.be.undefined;
    expect(tree.readContent('/src/baz/foo/foo.guard.ts')).to.be.equal(
      'import { Guard, CanActivate, ExecutionContext } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@Guard()\n' +
      'export class FooGuard implements CanActivate {\n' +
      '  canActivate(dataOrRequest, context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {\n' +
      '    return true;\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage name to dasherize', () => {
    const options: GuardOptions = {
      name: 'fooBar'
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/foo-bar/foo-bar.guard.ts')).to.not.be.undefined;
    expect(tree.readContent('/src/foo-bar/foo-bar.guard.ts')).to.be.equal(
      'import { Guard, CanActivate, ExecutionContext } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@Guard()\n' +
      'export class FooBarGuard implements CanActivate {\n' +
      '  canActivate(dataOrRequest, context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {\n' +
      '    return true;\n' +
      '  }\n' +
      '}\n'
    );
  });
  it('should manage path to dasherize', () => {
    const options: GuardOptions = {
      name: 'barBaz/foo'
    };
    const tree: UnitTestTree = runner.runSchematic('guard', options, new VirtualTree());
    const files: string[] = tree.files;
    expect(files.find((filename) => filename === '/src/bar-baz/foo/foo.guard.ts')).to.not.be.undefined;
    expect(tree.readContent('/src/bar-baz/foo/foo.guard.ts')).to.be.equal(
      'import { Guard, CanActivate, ExecutionContext } from \'@nestjs/common\';\n' +
      'import { Observable } from \'rxjs/Observable\';\n' +
      '\n' +
      '@Guard()\n' +
      'export class FooGuard implements CanActivate {\n' +
      '  canActivate(dataOrRequest, context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {\n' +
      '    return true;\n' +
      '  }\n' +
      '}\n'
    );
  });
});
