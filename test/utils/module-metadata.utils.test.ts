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
      '@Module({\n' +
      '  imports: [\n' +
      '    FooModule\n' +
      '  ]\n' +
      '})\n' +
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
      '  controllers: [\n' +
      '    AppController\n' +
      '  ],\n' +
      '  components: []\n' +
      '})\n' +
      'export class ApplicationModule {}\n';
    const output: string = ModuleMetadataUtils.insert(source, 'FooModule');
    expect(output).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    FooModule\n' +
      '  ],\n' +
      '  controllers: [\n' +
      '    AppController\n' +
      '  ],\n' +
      '  components: []\n' +
      '})\n' +
      'export class ApplicationModule {}\n'
    );
  });
  it('should add the symbol to the existing ones when insert', () => {
    const source =
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BarModule\n' +
      '  ],\n' +
      '  controllers: [\n' +
      '    AppController\n' +
      '  ],\n' +
      '  components: []\n' +
      '})\n' +
      'export class ApplicationModule {}\n';
    const output: string = ModuleMetadataUtils.insert(source, 'FooModule');
    expect(output).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { AppController } from \'./app.controller\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BarModule,\n' +
      '    FooModule\n' +
      '  ],\n' +
      '  controllers: [\n' +
      '    AppController\n' +
      '  ],\n' +
      '  components: []\n' +
      '})\n' +
      'export class ApplicationModule {}\n'
    );
  });
});
