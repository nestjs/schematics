import { expect } from 'chai';
import { MetadataManager } from '../../src/utils/metadata.manager';

describe.only('Metadata Manager', () => {
  it('should insert the new metadata', () => {
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n'
    );
    const metadata = 'imports';
    const symbol = 'FooModule'
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      `    ${ symbol }\n` +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should insert the new metadata when existing metadata', () => {
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n' + 
      '  controllers: [\n' +
      '    FooController\n' +
      '  ]\n' + 
      '})\n' +
      'export class FooModule {}\n'
    );
    const metadata = 'imports';
    const symbol = 'FooModule'
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n' +
      '  controllers: [\n' +
      '    FooController\n' +
      '  ],\n' + 
      '  imports: [\n' +
      `    ${ symbol }\n`+
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should insert the symbol to the metadata', () => {
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      '    BarModule\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
    const metadata = 'imports';
    const symbol = 'FooModule'
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n'+
      '    BarModule,\n' +
      `    ${ symbol }\n` +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should insert the symbol to right metadata', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      '    BarModule\n' +
      '  ],\n' +
      '  controllers: [\n' + 
      '    FooController\n' + 
      '  ]' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      '    BarModule,\n' +
      `    ${ symbol }\n` +
      '  ],\n' +
      '  controllers: [\n' + 
      '    FooController\n' + 
      '  ]' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage forRoot()', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      '    BarModule.forRoot()\n' +
      '  ],\n' +
      '  controllers: [\n' + 
      '    FooController\n' + 
      '  ]' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      '    BarModule.forRoot(),\n' +
      `    ${ symbol }\n` +
      '  ],\n' +
      '  controllers: [\n' + 
      '    FooController\n' + 
      '  ]' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage forRoot() with data containing array', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      '    BarModule.forRoot({\n' + 
      '      arry: [\n' +
      '        Symbol\n' +
      '      ]' +
      '    })\n' +
      '  ],\n' +
      '  controllers: [\n' + 
      '    FooController\n' + 
      '  ]' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      '    BarModule.forRoot({\n' + 
      '      arry: [\n' +
      '        Symbol\n' +
      '      ]' +
      '    }),\n' +
      `    ${ symbol }\n` +
      '  ],\n' +
      '  controllers: [\n' + 
      '    FooController\n' + 
      '  ]' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
});
