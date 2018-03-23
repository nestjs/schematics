import { expect } from 'chai';
import { ModuleMetadataUtils } from '../../src/utils/module-metadata.utils';

describe('Module Metadata Utils', () => {
  it('should create the imports metadata if not exist when insert', () => {
    const source =
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class ApplicationModule {}\n';
    const output: string = ModuleMetadataUtils.insert(source, 'FooModule');
    expect(output).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      '\n' +
      `@Module(${ JSON.stringify({ imports: [ 'FooModule' ]}, null, 2)})\n` +
      'export class ApplicationModule {}\n'
    );
  });
  it('should add the module symbol to the existing metadata when insert', () => {
    const source =
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [],\n' +
      '  controllers: [AppController],\n' +
      '  components: [],\n' +
      '})\n' +
      'export class ApplicationModule {}\n';
    const output: string = ModuleMetadataUtils.insert(source, 'FooModule');
    expect(output).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      '\n' +
      `@Module(${ JSON.stringify({
        imports: [ 'FooModule' ],
        controllers: [ 'AppController' ],
        components: []
      }, null, 2) })\n` +
      'export class ApplicationModule {}\n'
    );
  });
});
