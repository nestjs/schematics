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
      expect(dev.jest).toBe('^30.4.0');
      expect(dev['@types/jest']).toBe('^30.0.0');
      expect(dev['ts-jest']).toBe('^29.4.0');
      expect(output()).toMatch(/Node\.js v24\.9\+/);
    });

    it('should run Jest scripts with --experimental-vm-modules', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            scripts: {
              build: 'nest build',
              test: 'jest',
              'test:watch': 'jest --watch',
              'test:cov': 'jest --coverage',
              'test:debug':
                'node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand',
              'test:e2e': 'jest --config ./test/jest-e2e.json',
            },
            devDependencies: { jest: '^30.0.0', 'ts-jest': '^29.4.0' },
          }),
        }),
      );
      const scripts = readJson(tree, '/package.json').scripts;
      expect(scripts).toEqual({
        build: 'nest build',
        test: 'node --experimental-vm-modules ./node_modules/jest/bin/jest.js',
        'test:watch':
          'node --experimental-vm-modules ./node_modules/jest/bin/jest.js --watch',
        'test:cov':
          'node --experimental-vm-modules ./node_modules/jest/bin/jest.js --coverage',
        'test:debug':
          'node --experimental-vm-modules --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand',
        'test:e2e':
          'node --experimental-vm-modules ./node_modules/jest/bin/jest.js --config ./test/jest-e2e.json',
      });
      expect(output()).toMatch(
        /updated the "test:e2e" script to run Jest with --experimental-vm-modules/,
      );
    });

    it('should run every Jest command of a compound script with the flag', async () => {
      const scripts = {
        test: 'jest && jest --config ./test/jest-e2e.json',
        'test:all': 'npm run build && jest --ci; jest --watchAll=false',
        'test:mixed':
          'node --experimental-vm-modules ./node_modules/jest/bin/jest.js || jest',
      };
      const project = (scripts: Record<string, string>) =>
        createProject({
          'package.json': packageJson({
            scripts,
            devDependencies: { jest: '^30.4.0' },
          }),
        });
      const tree = await run(project(scripts));
      const updated = readJson(tree, '/package.json').scripts;
      expect(updated).toEqual({
        test: 'node --experimental-vm-modules ./node_modules/jest/bin/jest.js && node --experimental-vm-modules ./node_modules/jest/bin/jest.js --config ./test/jest-e2e.json',
        'test:all':
          'npm run build && node --experimental-vm-modules ./node_modules/jest/bin/jest.js --ci; node --experimental-vm-modules ./node_modules/jest/bin/jest.js --watchAll=false',
        'test:mixed':
          'node --experimental-vm-modules ./node_modules/jest/bin/jest.js || node --experimental-vm-modules ./node_modules/jest/bin/jest.js',
      });

      messages = [];
      const again = await run(project(updated));
      expect(readJson(again, '/package.json').scripts).toEqual(updated);
      expect(output()).not.toMatch(/script (to run|runs) Jest/);
    });

    it('should not touch node scripts that only have "jest" in their name', async () => {
      const scripts = {
        'test:clean': 'node scripts/clear-jest-cache.js',
        'test:helper': 'node scripts/run-jest',
        'test:codemod': 'jest-codemods',
      };
      const tree = await run(
        createProject({
          'package.json': packageJson({
            scripts,
            devDependencies: { jest: '^30.4.0' },
          }),
        }),
      );
      expect(readJson(tree, '/package.json').scripts).toEqual(scripts);
      expect(output()).not.toMatch(/script (to run|runs) Jest/);
    });

    it('should ask to pass the flag where Jest is started indirectly', async () => {
      const scripts = {
        'test:ci': 'cross-env NODE_ENV=test jest --ci',
        'test:tz': 'TZ=UTC jest',
        'test:npx': 'npx jest --runInBand',
        'test:env': 'dotenv -e .env.test -- jest',
      };
      const tree = await run(
        createProject({
          'package.json': packageJson({
            scripts,
            devDependencies: { jest: '^30.4.0' },
          }),
        }),
      );
      expect(readJson(tree, '/package.json').scripts).toEqual(scripts);
      const text = output();
      expect(text).toMatch(
        /the "test:ci" script runs Jest without --experimental-vm-modules \("cross-env NODE_ENV=test jest --ci"\)\. Start Jest through Node\.js with the flag, e\.g\. "cross-env NODE_ENV=test node --experimental-vm-modules \.\/node_modules\/jest\/bin\/jest\.js --ci"/,
      );
      expect(text).toMatch(
        /"test:tz"[\s\S]*"TZ=UTC node --experimental-vm-modules \.\/node_modules\/jest\/bin\/jest\.js"/,
      );
      expect(text).toMatch(
        /"test:npx"[\s\S]*"node --experimental-vm-modules \.\/node_modules\/jest\/bin\/jest\.js --runInBand"/,
      );
      expect(text).toMatch(
        /"test:env"[\s\S]*"dotenv -e \.env\.test -- node --experimental-vm-modules \.\/node_modules\/jest\/bin\/jest\.js"/,
      );
    });

    it('should report instead of rewriting when there is no local node_modules/jest (Yarn PnP)', async () => {
      const scripts = { test: 'jest' };
      const tree = await run(
        createProject({
          '.pnp.cjs': '',
          'package.json': packageJson({
            scripts,
            devDependencies: { jest: '^30.4.0' },
          }),
        }),
      );
      expect(readJson(tree, '/package.json').scripts).toEqual(scripts);
      expect(output()).toMatch(
        /the "test" script runs Jest without --experimental-vm-modules, and "\.\/node_modules\/jest\/bin\/jest\.js" does not exist[\s\S]*"cross-env NODE_OPTIONS=\\"\$NODE_OPTIONS --experimental-vm-modules\\" jest"/,
      );
    });

    it('should report instead of rewriting when Jest is hoisted out of node_modules', async () => {
      const scripts = { test: 'jest' };
      const tree = await run(
        createProject({
          'node_modules/@nestjs/core/package.json': '{}',
          'package.json': packageJson({
            scripts,
            devDependencies: { jest: '^30.4.0' },
          }),
        }),
      );
      expect(readJson(tree, '/package.json').scripts).toEqual(scripts);
      expect(output()).toMatch(
        /"\.\/node_modules\/jest\/bin\/jest\.js" does not exist/,
      );
    });

    it('should rewrite when node_modules has a local Jest', async () => {
      const tree = await run(
        createProject({
          'node_modules/jest/bin/jest.js': '',
          'package.json': packageJson({
            scripts: { test: 'jest' },
            devDependencies: { jest: '^30.4.0' },
          }),
        }),
      );
      expect(readJson(tree, '/package.json').scripts.test).toBe(
        'node --experimental-vm-modules ./node_modules/jest/bin/jest.js',
      );
    });

    it('should leave scripts that pass the flag or start Jest differently alone', async () => {
      const scripts = {
        test: 'NODE_OPTIONS=--experimental-vm-modules npx jest',
        'test:ci': 'cross-env NODE_ENV=test jest --ci',
        'test:clean': 'node scripts/clear-jest-cache.js',
      };
      const tree = await run(
        createProject({
          'package.json': packageJson({
            scripts,
            devDependencies: { jest: '^30.0.0' },
          }),
        }),
      );
      expect(readJson(tree, '/package.json').scripts).toEqual(scripts);
      expect(output()).toMatch(/NODE_OPTIONS=--experimental-vm-modules/);
    });

    it('should raise Jest 30 releases that cannot require() ESM', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            devDependencies: { jest: '^30.2.0' },
          }),
        }),
      );
      expect(readJson(tree, '/package.json').devDependencies.jest).toBe(
        '^30.4.0',
      );
      expect(output()).toMatch(
        /Updated "jest" from "\^30\.2\.0" to "\^30\.4\.0"/,
      );
    });

    it('should keep an up-to-date Jest stack untouched', async () => {
      const tree = await run(
        createProject({
          'package.json': packageJson({
            devDependencies: {
              jest: '^30.5.0',
              '@types/jest': '^30.0.0',
              'ts-jest': '^29.4.1',
            },
          }),
        }),
      );
      const dev = readJson(tree, '/package.json').devDependencies;
      expect(dev.jest).toBe('^30.5.0');
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
  });
});
