import { normalize } from '@angular-devkit/core';
import { expect } from 'chai';
import { ModuleMetadataDeclarator } from '../../src/utils/module-metadata.declarator';
import { DeclarationOptions } from '../../src/utils/module.declarator';

describe('Module Metadata Declarator', () => {
  let declarator: ModuleMetadataDeclarator;
  before(() => declarator = new ModuleMetadataDeclarator());
  it('should manage empty metadata', () => {
    const content: string =
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule'
    };
    expect(declarator.declare(content, options)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BarModule\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage existing metadata', () => {
    const content =
      'import { Module } from \'@nestjs/common\';\n' +
      'import { BazModule } from \'./baz/baz.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BazModule' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule'
    };
    expect(declarator.declare(content, options)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { BazModule } from \'./baz/baz.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BazModule,\n' +
      '    BarModule\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage trailing comma', () => {
    const content =
      'import { Module } from \'@nestjs/common\';\n' +
      'import { BazModule } from \'./baz/baz.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BazModule,\n' +
      '  ],\n' +
      '})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule'
    };
    expect(declarator.declare(content, options)).to.be.equal(
      'import { Module } from \'@nestjs/common\';\n' +
      'import { BazModule } from \'./baz/baz.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BazModule,\n' +
      '    BarModule\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n'
    );
  });
  it('should manage unformated metadata definition', () => {
    const content =
      'import { HelmetMiddleware } from \'@nest-middlewares/helmet\';\n' +
      'import { MiddlewaresConsumer, Module, RequestMethod } from \'@nestjs/common\';\n' +
      'import { ConfigModule } from \'./common/config/config.module\';\n' +
      'import { AuthMiddleware } from \'./middlewares/auth/auth-middleware\';\n' +
      'import { AuthService } from \'./middlewares/auth/auth.service\';\n' +
      'import { JwtStrategy } from \'./middlewares/auth/passport/jwt.strategy\';\n' +
      'import { PlayersModule } from \'./routes/players/players.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [ConfigModule, PlayersModule,],\n' +
      '  controllers: [],\n' +
      '  components: [AuthService, Jwt3Strategy]\n' +
      '})\n' +
      'export class AppModule {\n' +
      '  public configure(consumer: MiddlewaresConsumer): void {\n' +
      '    consumer\n' +
      '      .apply(HelmetMiddleware)\n' + 
      '      .forRoutes({ path: \'*\', method: RequestMethod.GET })\n' +
      '      .apply(AuthMiddleware)\n' +
      '      .forRoutes({ path: \'*\', method: RequestMethod.GET });\n' +
      '  }\n' +
      '};\n'
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule'
    };
    expect(declarator.declare(content, options)).to.be.equal(
      'import { HelmetMiddleware } from \'@nest-middlewares/helmet\';\n' +
      'import { MiddlewaresConsumer, Module, RequestMethod } from \'@nestjs/common\';\n' +
      'import { ConfigModule } from \'./common/config/config.module\';\n' +
      'import { AuthMiddleware } from \'./middlewares/auth/auth-middleware\';\n' +
      'import { AuthService } from \'./middlewares/auth/auth.service\';\n' +
      'import { JwtStrategy } from \'./middlewares/auth/passport/jwt.strategy\';\n' +
      'import { PlayersModule } from \'./routes/players/players.module\';\n' +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    ConfigModule,\n' + 
      '    PlayersModule,\n' +
      '    BarModule\n' +
      '  ],\n' +
      '  controllers: [],\n' +
      '  components: [\n' + 
      '    AuthService,\n' +
      '    Jwt3Strategy\n' +
      '  ]\n' +
      '})\n' +
      'export class AppModule {\n' +
      '  public configure(consumer: MiddlewaresConsumer): void {\n' +
      '    consumer\n' +
      '      .apply(HelmetMiddleware)\n' + 
      '      .forRoutes({ path: \'*\', method: RequestMethod.GET })\n' +
      '      .apply(AuthMiddleware)\n' +
      '      .forRoutes({ path: \'*\', method: RequestMethod.GET });\n' +
      '  }\n' +
      '};\n'
    );
  });
});
