import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import {
  checkNodeVersion,
  isSupportedNodeVersion,
} from './steps/preconditions.step.js';
import type { UpgradeOptions } from './upgrade.schema.js';
import { parseMajor, UpgradeReport } from './upgrade.utils.js';

const readJson = (tree: UnitTestTree, filePath: string) =>
  tree.readJson(filePath) as Record<string, any>;

const read = (tree: UnitTestTree, filePath: string) =>
  tree.readContent(filePath);

function packageJson(overrides: Record<string, any> = {}) {
  return JSON.stringify(
    {
      name: 'my-app',
      version: '0.0.1',
      dependencies: {
        '@nestjs/common': '^11.0.1',
        '@nestjs/core': '^11.0.1',
        '@nestjs/platform-express': '^11.0.1',
        'reflect-metadata': '^0.2.2',
        rxjs: '^7.8.1',
      },
      devDependencies: {
        '@nestjs/cli': '^11.0.0',
        '@nestjs/schematics': '^11.0.0',
        '@nestjs/testing': '^11.0.1',
        typescript: '^5.7.3',
      },
      ...overrides,
    },
    null,
    2,
  );
}

const APP_MODULE = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

const MAIN = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
`;

function createProject(files: Record<string, string> = {}): Tree {
  const tree = Tree.empty();
  const defaults: Record<string, string> = {
    'package.json': packageJson(),
    'nest-cli.json': JSON.stringify({ sourceRoot: 'src' }),
    'src/main.ts': MAIN,
    'src/app.module.ts': APP_MODULE,
  };
  for (const [filePath, content] of Object.entries({ ...defaults, ...files })) {
    tree.create(filePath, content);
  }
  return tree;
}

describe('Upgrade Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  const run = (tree: Tree, options: UpgradeOptions = {}) =>
    runner.runSchematic('upgrade', { skipInstall: true, ...options }, tree);

  describe('preconditions', () => {
    it('should accept Node.js 20.19+, 22.12+ and newer majors only', () => {
      expect(isSupportedNodeVersion('20.18.3')).toBe(false);
      expect(isSupportedNodeVersion('20.19.0')).toBe(true);
      expect(isSupportedNodeVersion('21.7.3')).toBe(false);
      expect(isSupportedNodeVersion('22.11.0')).toBe(false);
      expect(isSupportedNodeVersion('22.12.0')).toBe(true);
      expect(isSupportedNodeVersion('24.1.0')).toBe(true);
    });

    it('should throw on unsupported Node.js versions', () => {
      expect(() => checkNodeVersion(new UpgradeReport(), '18.20.0')).toThrow(
        /Node\.js v20\.19\+ or v22\.12\+/,
      );
    });

    it('should warn when running on Node.js 20', () => {
      const report = new UpgradeReport();
      checkNodeVersion(report, '20.19.0');
      expect(report.warnings[0]).toMatch(/v22\.12\+/);
    });

    it('should throw when package.json is missing', async () => {
      await expect(run(Tree.empty())).rejects.toThrow(/package\.json/);
    });

    it('should throw when the project does not depend on NestJS', async () => {
      const tree = createProject({
        'package.json': JSON.stringify({ dependencies: { express: '^5' } }),
      });
      await expect(run(tree)).rejects.toThrow(/Is this a NestJS project/);
    });

    it('should instruct v10 projects to upgrade to v11 first', async () => {
      const tree = createProject({
        'package.json': packageJson({
          dependencies: { '@nestjs/core': '^10.4.0' },
        }),
      });
      await expect(run(tree)).rejects.toThrow(
        /Detected NestJS v10.*upgrade to v11 first/,
      );
    });

    it('should parse majors from ranges and reject dist-tags', () => {
      expect(parseMajor('^11.0.1')).toBe(11);
      expect(parseMajor('~11.1')).toBe(11);
      expect(parseMajor('11')).toBe(11);
      expect(parseMajor('>=11 <12')).toBe(11);
      expect(parseMajor('12.0.0-alpha.5')).toBe(12);
      expect(parseMajor('11.x')).toBe(11);
      expect(parseMajor('next')).toBeNull();
      expect(parseMajor('latest')).toBeNull();
      expect(parseMajor('*')).toBeNull();
      expect(parseMajor('workspace:*')).toBeNull();
    });
  });

  describe('dependencies', () => {
    it('should bump known NestJS packages and typescript', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            dependencies: {
              '@nestjs/common': '^11.0.1',
              '@nestjs/core': '^11.0.1',
              '@nestjs/graphql': '^13.0.0',
              '@nestjs/apollo': '^13.0.0',
              '@nestjs/config': '^4.0.0',
              '@nestjs/swagger': '^11.0.0',
              '@nestjs/typeorm': '^11.0.0',
            },
          }),
        }),
      );
      const pkg = readJson(tree, '/package.json');
      expect(pkg.dependencies['@nestjs/common']).toBe('^12.0.0');
      expect(pkg.dependencies['@nestjs/core']).toBe('^12.0.0');
      expect(pkg.dependencies['@nestjs/graphql']).toBe('^14.0.0');
      expect(pkg.dependencies['@nestjs/apollo']).toBe('^14.0.0');
      expect(pkg.dependencies['@nestjs/config']).toBe('^12.0.0');
      expect(pkg.dependencies['@nestjs/swagger']).toBe('^12.0.0');
      // unknown companion packages are left alone
      expect(pkg.dependencies['@nestjs/typeorm']).toBe('^11.0.0');
      expect(pkg.devDependencies['@nestjs/cli']).toBe('^12.0.0');
      expect(pkg.devDependencies['@nestjs/schematics']).toBe('^12.0.0');
      expect(pkg.devDependencies['@nestjs/testing']).toBe('^12.0.0');
      expect(pkg.devDependencies.typescript).toBe('^6.0.0');
    });

    it('should not add packages that are not installed', async () => {
      const tree = await run(createProject());
      const pkg = readJson(tree, '/package.json');
      expect(pkg.dependencies['@nestjs/graphql']).toBeUndefined();
      expect(pkg.dependencies['@nestjs/observe']).toBeUndefined();
      expect(pkg.dependencies['@nats-io/transport-node']).toBeUndefined();
    });

    it('should keep typescript when already on v6', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            devDependencies: { typescript: '^6.1.0' },
          }),
        }),
      );
      expect(readJson(tree, '/package.json').devDependencies.typescript).toBe(
        '^6.1.0',
      );
    });

    it('should use the dist-tag when provided', async () => {
      const tree = await run(createProject(), { tag: 'next' });
      const pkg = readJson(tree, '/package.json');
      expect(pkg.dependencies['@nestjs/core']).toBe('next');
      expect(pkg.devDependencies['@nestjs/cli']).toBe('next');
    });

    it('should preserve package.json formatting', async () => {
      const tree = await run(createProject());
      const content = read(tree, '/package.json');
      expect(content).toContain('  "dependencies": {\n    "@nestjs/common"');
      expect(content).toContain('"rxjs": "^7.8.1"');
    });

    it('should schedule an install with the detected package manager', async () => {
      await runner.runSchematic(
        'upgrade',
        {},
        createProject({ 'pnpm-lock.yaml': '' }),
      );
      expect(runner.tasks).toHaveLength(1);
      expect(runner.tasks[0].name).toBe('node-package');
      expect((runner.tasks[0].options as any).packageManager).toBe('pnpm');
    });

    it('should not schedule an install with --skip-install', async () => {
      await run(createProject());
      expect(runner.tasks).toHaveLength(0);
    });
  });

  describe('graphql', () => {
    const gqlProject = (files: Record<string, string>) =>
      createProject({
        'package.json': packageJson({
          dependencies: {
            '@nestjs/core': '^11.0.1',
            '@nestjs/graphql': '^13.0.0',
            '@nestjs/apollo': '^13.0.0',
            'subscriptions-transport-ws': '^0.11.0',
          },
        }),
        ...files,
      });

    it('should rename boolean "playground" to "graphiql"', async () => {
      const tree = await run(
        gqlProject({
          'src/app.module.ts': `import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: true,
    }),
  ],
})
export class AppModule {}
`,
        }),
      );
      const content = read(tree, '/src/app.module.ts');
      expect(content).toContain('      graphiql: false,\n');
      expect(content).not.toContain('playground');
    });

    it('should drop "playground" when "graphiql" is already configured', async () => {
      const tree = await run(
        gqlProject({
          'src/app.module.ts': `import { GraphQLModule } from '@nestjs/graphql';
export const config = GraphQLModule.forRoot({
  graphiql: true,
  playground: true,
  autoSchemaFile: true,
});
`,
        }),
      );
      expect(read(tree, '/src/app.module.ts')).toBe(
        `import { GraphQLModule } from '@nestjs/graphql';
export const config = GraphQLModule.forRoot({
  graphiql: true,
  autoSchemaFile: true,
});
`,
      );
    });

    it('should migrate subscriptions to graphql-ws and swap the dependency', async () => {
      const tree = await run(
        gqlProject({
          'src/app.module.ts': `import { GraphQLModule } from '@nestjs/graphql';
export const config = GraphQLModule.forRoot({
  subscriptions: {
    'subscriptions-transport-ws': {
      onConnect: (params) => params,
    },
  },
});
`,
        }),
      );
      const content = read(tree, '/src/app.module.ts');
      expect(content).toContain("'graphql-ws': {");
      expect(content).not.toContain('subscriptions-transport-ws');
      const pkg = readJson(tree, '/package.json');
      expect(pkg.dependencies['subscriptions-transport-ws']).toBeUndefined();
      expect(pkg.dependencies['graphql-ws']).toBe('^6.0.0');
    });

    it('should remove subscriptions-transport-ws when graphql-ws is already configured', async () => {
      const tree = await run(
        gqlProject({
          'src/app.module.ts': `import { GraphQLModule } from '@nestjs/graphql';
export const config = GraphQLModule.forRoot({
  subscriptions: {
    "graphql-ws": true,
    "subscriptions-transport-ws": true,
  },
});
`,
        }),
      );
      expect(read(tree, '/src/app.module.ts')).toBe(
        `import { GraphQLModule } from '@nestjs/graphql';
export const config = GraphQLModule.forRoot({
  subscriptions: {
    "graphql-ws": true,
  },
});
`,
      );
    });

    it('should ignore files that do not import the GraphQL packages', async () => {
      const content = `export const options = { playground: true };\n`;
      const tree = await run(gqlProject({ 'src/options.ts': content }));
      expect(read(tree, '/src/options.ts')).toBe(content);
    });
  });

  describe('nats', () => {
    it('should replace nats with @nats-io/transport-node and rewrite imports', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            dependencies: {
              '@nestjs/core': '^11.0.1',
              '@nestjs/microservices': '^11.0.1',
              nats: '^2.29.0',
            },
          }),
          'src/main.ts': `import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { headers } from "nats";
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.NATS,
    options: { servers: ['nats://localhost:4222'] },
  });
  await app.listen();
}
bootstrap();
`,
        }),
      );
      expect(read(tree, '/src/main.ts')).toContain(
        'import { headers } from "@nats-io/nats-core";',
      );
      const pkg = readJson(tree, '/package.json');
      expect(pkg.dependencies.nats).toBeUndefined();
      expect(pkg.dependencies['@nats-io/transport-node']).toBe('^3.0.0');
      expect(pkg.dependencies['@nats-io/nats-core']).toBe('^3.0.0');
    });

    it('should add the driver when the transport is used without the nats package', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            dependencies: {
              '@nestjs/core': '^11.0.1',
              '@nestjs/microservices': '^11.0.1',
            },
          }),
          'src/nats.ts': `import { Transport } from '@nestjs/microservices';
export const transport = Transport.NATS;
`,
        }),
      );
      const pkg = readJson(tree, '/package.json');
      expect(pkg.dependencies['@nats-io/transport-node']).toBe('^3.0.0');
      expect(pkg.dependencies['@nats-io/nats-core']).toBeUndefined();
    });

    it('should do nothing when NATS is not used', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            dependencies: {
              '@nestjs/core': '^11.0.1',
              '@nestjs/microservices': '^11.0.1',
            },
          }),
        }),
      );
      expect(
        readJson(tree, '/package.json').dependencies['@nats-io/transport-node'],
      ).toBeUndefined();
    });
  });

  describe('config', () => {
    const configProject = (files: Record<string, string>, joi = '^17.13.3') =>
      createProject({
        'package.json': packageJson({
          dependencies: {
            '@nestjs/core': '^11.0.1',
            '@nestjs/config': '^4.0.2',
            joi,
          },
        }),
        ...files,
      });

    it('should nest validationOptions under libraryOptions and bump joi', async () => {
      const tree = await run(
        configProject({
          'src/app.module.ts': `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({ PORT: Joi.number().default(3000) }),
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}
`,
        }),
      );
      expect(read(tree, '/src/app.module.ts')).toContain(
        `      validationOptions: { libraryOptions: {
        allowUnknown: false,
        abortEarly: true,
      } },`,
      );
      expect(readJson(tree, '/package.json').dependencies.joi).toBe('^18.0.0');
    });

    it('should leave already migrated validationOptions and joi v18 alone', async () => {
      const content = `import { ConfigModule } from '@nestjs/config';
export const mod = ConfigModule.forRoot({
  validationOptions: { libraryOptions: { allowUnknown: false } },
});
`;
      const tree = await run(
        configProject({ 'src/config.ts': content }, '^18.0.0'),
      );
      expect(read(tree, '/src/config.ts')).toBe(content);
      expect(readJson(tree, '/package.json').dependencies.joi).toBe('^18.0.0');
    });
  });

  describe('observe', () => {
    it('should install and wire up @nestjs/observe', async () => {
      const tree = await run(createProject(), { observe: true });
      expect(
        readJson(tree, '/package.json').dependencies['@nestjs/observe'],
      ).toBe('^0.1.0');
      expect(read(tree, '/src/app.module.ts')).toBe(
        `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createObserveModule } from '@nestjs/observe';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY,
      appSecret: process.env.OBSERVE_APP_SECRET,
      serviceId: 'my-app',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`,
      );
      expect(read(tree, '/src/main.ts')).toBe(
        `import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
`,
      );
    });

    it('should append to existing imports and options (ESM project)', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({ type: 'module' }),
          'src/main.ts': `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule, {
  abortOnError: false,
});
await app.listen(3000);
`,
          'src/app.module.ts': `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
`,
        }),
        { observe: true },
      );
      const main = read(tree, '/src/main.ts');
      expect(main).toContain(
        "import { AppModule, ObserveInstrument } from './app.module.js';",
      );
      expect(main).toContain(`const app = await NestFactory.create(AppModule, {
  abortOnError: false,
  instrument: ObserveInstrument,
});`);
      const module = read(tree, '/src/app.module.ts');
      expect(module).toContain(`  imports: [
    ConfigModule.forRoot(),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY,
      appSecret: process.env.OBSERVE_APP_SECRET,
      serviceId: 'my-app',
    }),
  ],`);
    });

    it('should add an options argument after a platform adapter', async () => {
      const tree = await run(
        createProject({
          'src/main.ts': `import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await app.listen(3000);
}
bootstrap();
`,
        }),
        { observe: true },
      );
      expect(read(tree, '/src/main.ts')).toContain(
        `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    instrument: ObserveInstrument,
  });`,
      );
    });

    it('should skip wiring when @nestjs/observe is already installed', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            dependencies: {
              '@nestjs/core': '^11.0.1',
              '@nestjs/observe': '^0.1.1',
            },
          }),
        }),
        { observe: true },
      );
      expect(read(tree, '/src/main.ts')).toBe(MAIN);
      expect(read(tree, '/src/app.module.ts')).toBe(APP_MODULE);
    });

    it('should not touch the project when observe is not requested', async () => {
      const tree = await run(createProject());
      expect(read(tree, '/src/main.ts')).toBe(MAIN);
      expect(read(tree, '/src/app.module.ts')).toBe(APP_MODULE);
    });
  });

  it('should be idempotent', async () => {
    const first = await run(
      createProject({
        'package.json': packageJson({
          dependencies: {
            '@nestjs/core': '^11.0.1',
            '@nestjs/graphql': '^13.0.0',
            '@nestjs/config': '^4.0.0',
            '@nestjs/microservices': '^11.0.0',
            nats: '^2.0.0',
            joi: '^17.0.0',
          },
        }),
        'src/app.module.ts': `import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    GraphQLModule.forRoot({ playground: true, subscriptions: { 'subscriptions-transport-ws': true } }),
    ConfigModule.forRoot({ validationOptions: { abortEarly: true } }),
  ],
})
export class AppModule {}
`,
      }),
      { observe: true },
    );
    const snapshot = (tree: UnitTestTree) =>
      ['/package.json', '/src/main.ts', '/src/app.module.ts'].map((file) =>
        read(tree, file),
      );
    const second = await run(first, { observe: true });
    expect(snapshot(second)).toEqual(snapshot(first));
  });
});
