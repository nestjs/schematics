import { normalize } from '@angular-devkit/core';
import { ModuleMetadataDeclarator } from '../../src/utils/module-metadata.declarator.js';
import { DeclarationOptions } from '../../src/utils/module.declarator.js';

describe('Module Metadata Declarator', () => {
  let declarator: ModuleMetadataDeclarator;
  beforeAll(() => (declarator = new ModuleMetadataDeclarator()));
  it('should manage empty metadata', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [BarModule]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should manage empty metadata with dynamic expressions', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      '\n' +
      '@Module({})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
      staticOptions: {
        name: 'forRoot',
        value: {
          test: true,
          prop: 1,
        },
      },
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [\n' +
        '    BarModule.forRoot({\n' +
        '      test: true,\n' +
        '      prop: 1\n' +
        '    })\n' +
        '  ]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });

  it('should manage empty metadata array with dynamic expressions', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      '\n' +
      '@Module({\n' +
      '  imports: []\n' +
      '})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
      staticOptions: {
        name: 'forRoot',
        value: {
          test: 'true',
          prop: 1,
        },
      },
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [\n' +
        '    BarModule.forRoot({\n' +
        "      test: 'true',\n" +
        '      prop: 1\n' +
        '    })\n' +
        '  ]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });

  it('should manage no metadata with dynamic expressions', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      '\n' +
      '@Module({\n' +
      '  providers: []\n' +
      '})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
      staticOptions: {
        name: 'forRoot',
        value: {
          test: true,
          prop: 1,
        },
      },
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({\n' +
        '  providers: [],\n' +
        '  imports: [\n' +
        '    BarModule.forRoot({\n' +
        '      test: true,\n' +
        '      prop: 1\n' +
        '    })\n' +
        '  ]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });

  it('should manage existing metadata', () => {
    const content =
      "import { Module } from '@nestjs/common';\n" +
      "import { BazModule } from './baz/baz.module';\n" +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    BazModule\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { BazModule } from './baz/baz.module';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [\n' +
        '    BazModule,\n' +
        '    BarModule\n' +
        '  ]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should manage trailing comma', () => {
    const content =
      "import { Module } from '@nestjs/common';\n" +
      "import { BazModule } from './baz/baz.module';\n" +
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
      symbol: 'BarModule',
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { BazModule } from './baz/baz.module';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [\n' +
        '    BazModule,\n' +
        '    BarModule,\n' +
        '  ],\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });

  it('should manage dynamic expression', () => {
    const content =
      "import { Module } from '@nestjs/common';\n" +
      "import { BazModule } from './baz/baz.module';\n" +
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
      symbol: 'BarModule',
      staticOptions: {
        name: 'forRoot',
        value: {
          test: true,
          prop: 1,
        },
      },
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { BazModule } from './baz/baz.module';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [\n' +
        '    BazModule,\n' +
        '    BarModule.forRoot({\n' +
        '      test: true,\n' +
        '      prop: 1\n' +
        '    }),\n' +
        '  ],\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });

  it('should manage unformated metadata definition', () => {
    const content =
      "import { HelmetMiddleware } from '@nest-middlewares/helmet';\n" +
      "import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';\n" +
      "import { ConfigModule } from './common/config/config.module';\n" +
      "import { AuthMiddleware } from './middlewares/auth/auth-middleware';\n" +
      "import { AuthService } from './middlewares/auth/auth.service';\n" +
      "import { JwtStrategy } from './middlewares/auth/passport/jwt.strategy';\n" +
      "import { PlayersModule } from './routes/players/players.module';\n" +
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
      "      .forRoutes({ path: '*', method: RequestMethod.GET })\n" +
      '      .apply(AuthMiddleware)\n' +
      "      .forRoutes({ path: '*', method: RequestMethod.GET });\n" +
      '  }\n' +
      '};\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { HelmetMiddleware } from '@nest-middlewares/helmet';\n" +
        "import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';\n" +
        "import { ConfigModule } from './common/config/config.module';\n" +
        "import { AuthMiddleware } from './middlewares/auth/auth-middleware';\n" +
        "import { AuthService } from './middlewares/auth/auth.service';\n" +
        "import { JwtStrategy } from './middlewares/auth/passport/jwt.strategy';\n" +
        "import { PlayersModule } from './routes/players/players.module';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [ConfigModule, PlayersModule, BarModule,],\n' +
        '  controllers: [],\n' +
        '  components: [AuthService, Jwt3Strategy]\n' +
        '})\n' +
        'export class AppModule {\n' +
        '  public configure(consumer: MiddlewaresConsumer): void {\n' +
        '    consumer\n' +
        '      .apply(HelmetMiddleware)\n' +
        "      .forRoutes({ path: '*', method: RequestMethod.GET })\n" +
        '      .apply(AuthMiddleware)\n' +
        "      .forRoutes({ path: '*', method: RequestMethod.GET });\n" +
        '  }\n' +
        '};\n',
    );
  });
  it('should manage module with forRoot() or forChild() call', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      "import { FooModule } from './foo/foo.module';\n" +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    FooModule.forRoot()\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { FooModule } from './foo/foo.module';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [\n' +
        '    FooModule.forRoot(),\n' +
        '    BarModule\n' +
        '  ]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should manage module with forRoot() or forChild() call with json configration inside', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      "import { FooModule } from './foo/foo.module';\n" +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    FooModule.forRoot({ key: value })\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        "import { FooModule } from './foo/foo.module';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [\n' +
        '    FooModule.forRoot({ key: value }),\n' +
        '    BarModule\n' +
        '  ]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });
  it('should manage comments', () => {
    const content: string =
      "import { Module } from '@nestjs/common';\n" +
      '\n' +
      '@Module({\n' +
      '  imports: [\n' +
      '    // FooModule.forRoot(),\n' +
      '    /* FooModule.forRoot(), */\n' +
      '  ]\n' +
      '})\n' +
      'export class FooModule {}\n';
    const options: DeclarationOptions = {
      metadata: 'imports',
      type: 'module',
      name: 'bar',
      path: normalize('/src/foo'),
      module: normalize('/src/foo/foo.module.ts'),
      symbol: 'BarModule',
    };
    expect(declarator.declare(content, options)).toEqual(
      "import { Module } from '@nestjs/common';\n" +
        '\n' +
        '@Module({\n' +
        '  imports: [\n' +
        '    // FooModule.forRoot(),\n' +
        '    /* FooModule.forRoot(), */\n' +
        '  BarModule]\n' +
        '})\n' +
        'export class FooModule {}\n',
    );
  });
});
