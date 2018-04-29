import { expect } from 'chai';
import { MetadataManager } from '../../src/utils/metadata.manager';

describe('Metadata Manager', () => {
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
      '  imports: [FooModule]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should insert the new metadata when existing metadata', () => {
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n' + 
      '  controllers: [FooController]\n' + 
      '})\n' +
      'export class FooModule {}\n'
    );
    const metadata = 'imports';
    const symbol = 'FooModule'
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n' +
      '  controllers: [FooController],\n' + 
      '  imports: [FooModule]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should insert the symbol to the metadata', () => {
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [BarModule]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
    const metadata = 'imports';
    const symbol = 'FooModule'
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [BarModule, FooModule]\n' +
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
      '  imports: [BarModule],\n' +
      '  controllers: [FooController]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [BarModule, FooModule],\n' +
      '  controllers: [FooController]\n' +
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
      '  imports: [BarModule.forRoot()],\n' +
      '  controllers: [FooController]' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [BarModule.forRoot(), FooModule],\n' +
      '  controllers: [FooController]' +
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
      '  imports: [BarModule.forRoot({ arry: [Symbol] })],\n' +
      '  controllers: [FooController]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [BarModule.forRoot({ arry: [Symbol] }), FooModule],\n' +
      '  controllers: [FooController]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should multi line formatted metadata', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n    BarModule\n  ],\n' +
      '  controllers: [\n    FooController\n  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n    BarModule,\n    FooModule\n  ],\n' +
      '  controllers: [\n    FooController\n  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage comments', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      '    BazModule\n' +
      '    // BarModule.forRoot()\n' +
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
      '    BazModule,\n' +
      '    FooModule\n' +
      '    // BarModule.forRoot()\n' +
      '  ],\n' +
      '  controllers: [\n' + 
      '    FooController\n' + 
      '  ]' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage trailing comma', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [BarModule,],\n' +
      '  controllers: [FooController]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [BarModule, FooModule,],\n' +
      '  controllers: [FooController]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage multi line trailing comma', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n    BarModule,\n  ],\n' +
      '  controllers: [\n    FooController\n  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n    BarModule,\n    FooModule,\n  ],\n' +
      '  controllers: [\n    FooController\n  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage multi line with configuration', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n    BarModule.forRoot({ arry: [Symbol] })\n  ],\n' +
      '  controllers: [\n    FooController\n  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n    BarModule.forRoot({ arry: [Symbol] }),\n    FooModule\n  ],\n' +
      '  controllers: [\n    FooController\n  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage existing empty metadata', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [],\n' +
      '  controllers: [FooController]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
    expect(manager.insert(metadata, symbol)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [FooModule],\n' +
      '  controllers: [FooController]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage existing metadata with comment', () => {
    const metadata = 'imports';
    const symbol = 'FooModule';
    const manager = new MetadataManager(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n'+
      '  imports: [\n' +
      '    // BarModule.forRoot()\n' +
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
      '    // BarModule.forRoot()\n' +
      '  FooModule],\n' +
      '  controllers: [\n' + 
      '    FooController\n' + 
      '  ]' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
});
