import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { UpgradeOptions } from './upgrade.schema.js';

const readJson = (tree: UnitTestTree, filePath: string) =>
  tree.readJson(filePath) as Record<string, any>;

const read = (tree: UnitTestTree, filePath: string) =>
  tree.readContent(filePath);

function packageJson(overrides: Record<string, any> = {}) {
  return JSON.stringify(
    {
      name: 'my-app',
      scripts: { build: 'nest build', start: 'nest start' },
      dependencies: {
        '@nestjs/common': '^11.0.1',
        '@nestjs/core': '^11.0.1',
      },
      devDependencies: {
        '@nestjs/cli': '^11.0.0',
        typescript: '^6.0.0',
      },
      ...overrides,
    },
    null,
    2,
  );
}

const APP_MODULE = `import { Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class AppModule {}
`;

const MAIN = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
`;

function createProject(files: Record<string, string> = {}): Tree {
  const tree = Tree.empty();
  const defaults: Record<string, string> = {
    'package.json': packageJson(),
    'nest-cli.json': JSON.stringify({ sourceRoot: 'src' }, null, 2),
    'src/main.ts': MAIN,
    'src/app.module.ts': APP_MODULE,
  };
  for (const [filePath, content] of Object.entries({ ...defaults, ...files })) {
    if (content !== undefined) {
      tree.create(filePath, content);
    }
  }
  return tree;
}

describe('Upgrade Factory (additional steps)', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  let messages: string[];
  beforeEach(() => {
    messages = [];
  });
  const run = async (tree: Tree, options: UpgradeOptions = {}) => {
    const subscription = runner.logger.subscribe((entry) =>
      messages.push(entry.message),
    );
    try {
      return await runner.runSchematic(
        'upgrade',
        { skipInstall: true, ...options },
        tree,
      );
    } finally {
      subscription.unsubscribe();
    }
  };
  const output = () => messages.join('\n');

  describe('webpack → rspack', () => {
    it('should replace "webpack: true" with the rspack builder', async () => {
      const tree = await run(
        createProject({
          'nest-cli.json': JSON.stringify(
            {
              sourceRoot: 'src',
              compilerOptions: { webpack: true, deleteOutDir: true },
            },
            null,
            2,
          ),
        }),
      );
      expect(readJson(tree, '/nest-cli.json').compilerOptions).toEqual({
        builder: 'rspack',
        deleteOutDir: true,
      });
    });

    it('should carry webpackConfigPath over to builder.options.configPath', async () => {
      const tree = await run(
        createProject({
          'nest-cli.json': JSON.stringify({
            sourceRoot: 'src',
            compilerOptions: {
              webpack: true,
              webpackConfigPath: 'webpack-hmr.config.js',
            },
            projects: {
              api: {
                type: 'application',
                root: 'apps/api',
                compilerOptions: { builder: 'webpack' },
              },
            },
          }),
        }),
      );
      const config = readJson(tree, '/nest-cli.json');
      expect(config.compilerOptions).toEqual({
        builder: {
          type: 'rspack',
          options: { configPath: 'webpack-hmr.config.js' },
        },
      });
      expect(config.projects.api.compilerOptions).toEqual({
        builder: 'rspack',
      });
      expect(output()).toMatch(
        /Port the webpack configuration file\(s\) "webpack-hmr\.config\.js"/,
      );
    });

    it('should keep an explicit non-webpack builder and drop the deprecated keys', async () => {
      const tree = await run(
        createProject({
          'nest-cli.json': JSON.stringify({
            sourceRoot: 'src',
            compilerOptions: { webpack: false, builder: 'swc' },
          }),
        }),
      );
      expect(readJson(tree, '/nest-cli.json').compilerOptions).toEqual({
        builder: 'swc',
      });
    });

    it('should rewrite --webpack flags in package.json scripts', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            scripts: {
              build: 'nest build --webpack',
              'start:dev':
                'nest start --watch --webpack --webpackPath webpack-hmr.config.js',
              'start:swc': 'nest start -b swc',
            },
          }),
        }),
      );
      const scripts = readJson(tree, '/package.json').scripts;
      expect(scripts.build).toBe('nest build --builder rspack');
      expect(scripts['start:dev']).toBe(
        'nest start --watch --builder rspack --rspackPath webpack-hmr.config.js',
      );
      expect(scripts['start:swc']).toBe('nest start -b swc');
    });

    it('should leave projects without webpack alone', async () => {
      const tree = await run(createProject());
      expect(readJson(tree, '/nest-cli.json')).toEqual({ sourceRoot: 'src' });
      expect(output()).not.toMatch(/rspack/i);
    });
  });

  describe('test runner', () => {
    it('should bump jest, @types/jest and ts-jest for Jest 30', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            devDependencies: {
              jest: '^29.7.0',
              '@types/jest': '^29.5.14',
              'ts-jest': '^29.2.5',
            },
          }),
        }),
      );
      const dev = readJson(tree, '/package.json').devDependencies;
      expect(dev.jest).toBe('^30.0.0');
      expect(dev['@types/jest']).toBe('^30.0.0');
      expect(dev['ts-jest']).toBe('^29.4.0');
      expect(output()).toMatch(/Node\.js v24\.9\+/);
    });

    it('should keep an up-to-date Jest stack untouched', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            devDependencies: {
              jest: '^30.1.0',
              '@types/jest': '^30.0.0',
              'ts-jest': '^29.4.1',
            },
          }),
        }),
      );
      const dev = readJson(tree, '/package.json').devDependencies;
      expect(dev.jest).toBe('^30.1.0');
      expect(dev['ts-jest']).toBe('^29.4.1');
    });

    it('should say nothing about Jest for Vitest projects', async () => {
      await run(
        createProject({
          'package.json': packageJson({
            devDependencies: { vitest: '^4.0.0' },
          }),
        }),
      );
      expect(output()).not.toMatch(/Jest/);
    });
  });

  describe('engines', () => {
    it('should raise engines.node below the v12 minimum', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({ engines: { node: '>=18.0.0' } }),
        }),
      );
      expect(readJson(tree, '/package.json').engines.node).toBe('>=20.19.0');
    });

    it('should keep engines.node when it already satisfies the minimum', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            engines: { node: '^22.12.0 || >=24' },
          }),
        }),
      );
      expect(readJson(tree, '/package.json').engines.node).toBe(
        '^22.12.0 || >=24',
      );
    });

    it('should not add an engines field', async () => {
      const tree = await run(createProject());
      expect(readJson(tree, '/package.json').engines).toBeUndefined();
    });
  });

  describe('observe (monorepo)', () => {
    it('should wire every application project with its name as serviceId', async () => {
      const main = (
        moduleName: string,
      ) => `import { NestFactory } from '@nestjs/core';
import { ${moduleName} } from './${moduleName.toLowerCase()}';

async function bootstrap() {
  const app = await NestFactory.create(${moduleName});
  await app.listen(3000);
}
bootstrap();
`;
      const mod = (
        moduleName: string,
      ) => `import { Module } from '@nestjs/common';

@Module({})
export class ${moduleName} {}
`;
      const tree = await run(
        createProject({
          'nest-cli.json': JSON.stringify({
            monorepo: true,
            root: 'apps/api',
            sourceRoot: 'apps/api/src',
            projects: {
              api: {
                type: 'application',
                root: 'apps/api',
                entryFile: 'main',
                sourceRoot: 'apps/api/src',
              },
              worker: { type: 'application', root: 'apps/worker' },
              shared: {
                type: 'library',
                root: 'libs/shared',
                sourceRoot: 'libs/shared/src',
              },
            },
          }),
          'apps/api/src/main.ts': main('ApiModule'),
          'apps/api/src/apimodule.ts': mod('ApiModule'),
          'apps/worker/src/main.ts': main('WorkerModule'),
          'apps/worker/src/workermodule.ts': mod('WorkerModule'),
          'libs/shared/src/main.ts': main('SharedModule'),
          'libs/shared/src/sharedmodule.ts': mod('SharedModule'),
        }),
        { observe: true },
      );
      expect(read(tree, '/apps/api/src/apimodule.ts')).toContain(
        "serviceId: 'api',",
      );
      expect(read(tree, '/apps/worker/src/workermodule.ts')).toContain(
        "serviceId: 'worker',",
      );
      expect(read(tree, '/apps/api/src/main.ts')).toContain(
        'instrument: ObserveInstrument',
      );
      expect(read(tree, '/apps/worker/src/main.ts')).toContain(
        'instrument: ObserveInstrument',
      );
      expect(read(tree, '/libs/shared/src/sharedmodule.ts')).not.toContain(
        'Observe',
      );
      // the root project is the same as "api" and must not be wired twice
      expect(
        read(tree, '/apps/api/src/apimodule.ts').match(
          /ObserveModule\.forRoot/g,
        ),
      ).toHaveLength(1);
    });
  });

  describe('diagnostics', () => {
    it('should flag custom pipes, structured logging and lifecycle hooks', async () => {
      await run(
        createProject({
          'src/parse.pipe.ts': `import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
@Injectable()
export class ParsePipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata) { return Number(value); }
}
`,
          'src/a.service.ts': `import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
@Injectable()
export class AService implements OnModuleInit {
  private readonly logger = new Logger(AService.name);
  onModuleInit() { this.logger.log('ready', { port: 3000 }); }
}
`,
          'src/b.service.ts': `import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
@Injectable()
export class BService implements OnApplicationBootstrap {
  onApplicationBootstrap() {}
}
`,
          'src/a.service.spec.ts': `describe('x', () => { it('onModuleInit(', () => {}); });`,
        }),
      );
      const text = output();
      expect(text).toMatch(/Custom pipes found in \/src\/parse\.pipe\.ts/);
      expect(text).toMatch(
        /Logger calls that pass an object after the message were found in \/src\/a\.service\.ts/,
      );
      expect(text).toMatch(
        /Lifecycle hooks are implemented in 2 files \(\/src\/a\.service\.ts, \/src\/b\.service\.ts\)/,
      );
    });

    it('should stay quiet for plain projects', async () => {
      await run(createProject());
      const text = output();
      expect(text).not.toMatch(
        /Custom pipes|structured params|Lifecycle hooks/,
      );
    });
  });

  describe('tsconfig', () => {
    it('should ask v10-era projects to switch to nodenext', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: { module: 'commonjs', target: 'ES2021' },
          }),
        }),
      );
      expect(output()).toMatch(
        /"module": "commonjs" with a legacy module resolution[\s\S]*"moduleResolution": "nodenext"/,
      );
    });

    it('should flag node10 resolution even with a modern module setting', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: { module: 'es2022', moduleResolution: 'node' },
          }),
        }),
      );
      expect(output()).toMatch(
        /"moduleResolution": "node", which TypeScript 6 no longer supports/,
      );
    });

    it('should accept nodenext', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              strict: false,
            },
          }),
        }),
      );
      expect(output()).not.toMatch(/tsconfig\.json/);
    });

    it('should ask for an explicit rootDir in tsconfig.build.json', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
            },
          }),
          'tsconfig.build.json': JSON.stringify({
            extends: './tsconfig.json',
            include: ['src'],
          }),
        }),
      );
      expect(output()).toMatch(
        /tsconfig\.build\.json does not set "rootDir"[\s\S]*TS5011/,
      );
    });

    it('should accept a tsconfig.build.json that already sets rootDir', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
            },
          }),
          'tsconfig.build.json': JSON.stringify({
            extends: './tsconfig.json',
            compilerOptions: { rootDir: './src' },
            include: ['src'],
          }),
        }),
      );
      expect(output()).not.toMatch(/rootDir/);
    });

    it('should still ask for rootDir in tsconfig.build.json when tsconfig.json sets "."', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              rootDir: '.',
            },
          }),
          'tsconfig.build.json': JSON.stringify({
            extends: './tsconfig.json',
            include: ['src'],
          }),
        }),
      );
      expect(output()).toMatch(
        /tsconfig\.build\.json does not set "rootDir"[\s\S]*TS5011/,
      );
    });

    it('should accept a rootDir inherited from tsconfig.json when it points at src', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              rootDir: './src',
            },
          }),
          'tsconfig.build.json': JSON.stringify({
            extends: './tsconfig.json',
            include: ['src'],
          }),
        }),
      );
      expect(output()).not.toMatch(/rootDir/);
    });

    it('should flag a "./" baseUrl, which TypeScript 6 rejects', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              baseUrl: './',
              paths: { '@app/shared': ['libs/shared/src'] },
            },
          }),
        }),
      );
      expect(output()).toMatch(
        /tsconfig\.json sets "baseUrl": "\.\/", which TypeScript 6 rejects \(error TS5101\)\. Remove it, prefix any "paths" targets with "\.\/"[\s\S]*"src\/\*": \["\.\/src\/\*"\][\s\S]*"ignoreDeprecations": "6\.0"/,
      );
    });

    it('should ask to rewrite "paths" for any other baseUrl', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              baseUrl: './src',
              paths: { '@app/*': ['app/*'] },
            },
          }),
        }),
      );
      const text = output();
      expect(text).toMatch(
        /tsconfig\.json sets "baseUrl": "\.\/src"[\s\S]*TS5101[\s\S]*Rewrite "paths" targets relative to tsconfig\.json/,
      );
      expect(text).not.toMatch(/Remove it/);
    });

    it('should accept baseUrl with "ignoreDeprecations": "6.0"', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              baseUrl: './',
              ignoreDeprecations: '6.0',
            },
          }),
        }),
      );
      expect(output()).not.toMatch(/baseUrl/);
    });

    it('should ask for "types" when the project relies on @types/node and @types/jest', async () => {
      await run(
        createProject({
          'package.json': packageJson({
            devDependencies: {
              '@types/jest': '^30.0.0',
              '@types/node': '^22.0.0',
              typescript: '^6.0.0',
            },
          }),
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
            },
          }),
        }),
      );
      expect(output()).toMatch(
        /tsconfig\.json does not set "types"[\s\S]*TS2591[\s\S]*TS2593[\s\S]*`"types": \["node", "jest"\]`/,
      );
    });

    it('should ask for rootDir in tsconfig.json when ts-jest compiles the specs', async () => {
      await run(
        createProject({
          'package.json': packageJson({
            devDependencies: {
              jest: '^30.0.0',
              'ts-jest': '^29.4.0',
              typescript: '^6.0.0',
            },
          }),
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
            },
          }),
        }),
      );
      expect(output()).toMatch(
        /tsconfig\.json does not set "rootDir"\. ts-jest compiles the specs with it[\s\S]*TS5011[\s\S]*`"rootDir": "\."`/,
      );
    });

    it('should flag the strict default of TypeScript 6 when "strict" is not set', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              strictNullChecks: true,
              noImplicitAny: false,
            },
          }),
        }),
      );
      expect(output()).toMatch(
        /tsconfig\.json does not set "strict", which TypeScript 6 enables by default[\s\S]*TS2564[\s\S]*`"strict": false`[\s\S]*`"strictPropertyInitialization": false`/,
      );
    });

    it('should accept an explicit "strict" setting', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              strict: true,
            },
          }),
        }),
      );
      expect(output()).not.toMatch(/"strict"/);
    });

    it('should flag the other options TypeScript 6 deprecates', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              strict: false,
              target: 'es5',
              downlevelIteration: true,
              esModuleInterop: false,
              allowSyntheticDefaultImports: true,
            },
          }),
        }),
      );
      const text = output();
      expect(text).toMatch(
        /tsconfig\.json sets "target": "es5", "downlevelIteration": true, "esModuleInterop": false, which TypeScript 6 deprecates[\s\S]*Remove them \(set "target" to "ES2023"[\s\S]*"ignoreDeprecations": "6\.0"/,
      );
      expect(text).not.toMatch(/"allowSyntheticDefaultImports"/);
    });

    it('should accept deprecated options with "ignoreDeprecations": "6.0"', async () => {
      await run(
        createProject({
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              strict: false,
              target: 'es5',
              ignoreDeprecations: '6.0',
            },
          }),
        }),
      );
      expect(output()).not.toMatch(/deprecates/);
    });

    it('should accept a tsconfig.json shaped like the v12 template', async () => {
      await run(
        createProject({
          'package.json': packageJson({
            devDependencies: {
              '@types/jest': '^30.0.0',
              '@types/node': '^22.0.0',
              jest: '^30.0.0',
              'ts-jest': '^29.4.0',
              typescript: '^6.0.0',
            },
          }),
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              module: 'nodenext',
              moduleResolution: 'nodenext',
              types: ['node', 'jest'],
              rootDir: '.',
              strict: false,
            },
          }),
          'tsconfig.build.json': JSON.stringify({
            extends: './tsconfig.json',
            compilerOptions: { rootDir: './src' },
            include: ['src'],
          }),
        }),
      );
      expect(output()).not.toMatch(/tsconfig/);
    });
  });
});
