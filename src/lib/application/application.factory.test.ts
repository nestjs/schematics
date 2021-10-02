import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ApplicationOptions } from './application.schema';
import { transform } from './application.factory';

describe('Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: ApplicationOptions = {
      name: 'project',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise();
    const files = tree.files;

    expect(files.sort()).toEqual(
      [
        '/project/.eslintrc.js',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/nest-cli.json',
        '/project/package.json',
        '/project/tsconfig.build.json',
        '/project/tsconfig.json',
        '/project/src/app.controller.spec.ts',
        '/project/src/app.controller.ts',
        '/project/src/app.module.ts',
        '/project/src/app.service.ts',
        '/project/src/main.ts',
        '/project/test/app.e2e-spec.ts',
        '/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should manage name to dasherize', async () => {
    const options: ApplicationOptions = {
      name: 'awesomeProject',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise();
    const files = tree.files;

    expect(files.sort()).toEqual(
      [
        '/awesome-project/.eslintrc.js',
        '/awesome-project/.gitignore',
        '/awesome-project/.prettierrc',
        '/awesome-project/README.md',
        '/awesome-project/nest-cli.json',
        '/awesome-project/package.json',
        '/awesome-project/tsconfig.build.json',
        '/awesome-project/tsconfig.json',
        '/awesome-project/src/app.controller.spec.ts',
        '/awesome-project/src/app.controller.ts',
        '/awesome-project/src/app.module.ts',
        '/awesome-project/src/app.service.ts',
        '/awesome-project/src/main.ts',
        '/awesome-project/test/app.e2e-spec.ts',
        '/awesome-project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should manage javascript files', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise();
    const files = tree.files;

    expect(files.sort()).toEqual(
      [
        '/project/.babelrc',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/index.js',
        '/project/jsconfig.json',
        '/project/nest-cli.json',
        '/project/nodemon.json',
        '/project/package.json',
        '/project/src/app.controller.js',
        '/project/src/app.controller.spec.js',
        '/project/src/app.module.js',
        '/project/src/app.service.js',
        '/project/src/main.js',
        '/project/test/app.e2e-spec.js',
        '/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should manage destination directory', async () => {
    const options: ApplicationOptions = {
      name: '@scope/package',
      directory: 'scope-package',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('application', options)
      .toPromise();
    const files = tree.files;

    expect(files.sort()).toEqual(
      [
        '/scope-package/.eslintrc.js',
        '/scope-package/.gitignore',
        '/scope-package/.prettierrc',
        '/scope-package/README.md',
        '/scope-package/nest-cli.json',
        '/scope-package/package.json',
        '/scope-package/tsconfig.build.json',
        '/scope-package/tsconfig.json',
        '/scope-package/src/app.controller.spec.ts',
        '/scope-package/src/app.controller.ts',
        '/scope-package/src/app.module.ts',
        '/scope-package/src/app.service.ts',
        '/scope-package/src/main.ts',
        '/scope-package/test/app.e2e-spec.ts',
        '/scope-package/test/jest-e2e.json',
      ].sort(),
    );
  });

  describe('[HTTP Application]', () => {
    it('should use express as the default HTTP platform', () => {
      const options: ApplicationOptions = {
        name: 'project',
      };

      expect(transform(options).platform).toBe('express');
    });

    describe('TypeScript project', () => {
      describe('When providing "express" as the platform', () => {
        let tree: UnitTestTree;

        beforeAll(async () => {
          const options: ApplicationOptions = {
            name: 'project',
            language: 'ts',
            platform: 'express',
          };
          tree = await runner
            .runSchematicAsync('application', options)
            .toPromise();
        });

        it('should generate bootstrap file for express platform, when providing platform option', async () => {
          const mainFileContent = tree.readContent(`/project/src/main.ts`);

          expect(mainFileContent.trim()).toEqual(
            `
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.listen(3000);
}
bootstrap();
  `.trim(),
          );
        });

        it('should generate package.json with only express-related dependencies', async () => {
          const packageJson = JSON.parse(
            tree.readContent(`/project/package.json`),
          );
          const prodDependenciesNames = Object.keys(packageJson.dependencies);
          const devDependenciesNames = Object.keys(packageJson.devDependencies);

          expect(prodDependenciesNames).toEqual(
            expect.arrayContaining(['@nestjs/platform-express']),
          );
          expect(devDependenciesNames).toEqual(
            expect.arrayContaining(['@types/express']),
          );
          expect(prodDependenciesNames).toEqual(
            expect.not.arrayContaining(['@nestjs/platform-fastify']),
          );
        });
      });

      describe('When providing "fastify" as the platform', () => {
        let tree: UnitTestTree;

        beforeAll(async () => {
          const options: ApplicationOptions = {
            name: 'project',
            language: 'ts',
            platform: 'fastify',
          };
          tree = await runner
            .runSchematicAsync('application', options)
            .toPromise();
        });

        it('should generate bootstrap file for fastify platform', async () => {
          const mainFileContent = tree.readContent(`/project/src/main.ts`);

          expect(mainFileContent.trim()).toEqual(
            `
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(3000);
}
bootstrap();
  `.trim(),
          );
        });

        it('should generate package.json with only fastify-related dependencies', async () => {
          const packageJson = JSON.parse(
            tree.readContent(`/project/package.json`),
          );
          const prodDependenciesNames = Object.keys(packageJson.dependencies);
          const devDependenciesNames = Object.keys(packageJson.devDependencies);

          expect(prodDependenciesNames).toEqual(
            expect.arrayContaining(['@nestjs/platform-fastify']),
          );
          expect(devDependenciesNames).toEqual(
            expect.not.arrayContaining(['@types/express']),
          );
          expect(prodDependenciesNames).toEqual(
            expect.not.arrayContaining(['@nestjs/platform-express']),
          );
        });
      });
    });

    describe('JavaScript project', () => {
      describe('When providing "express" as the platform', () => {
        let tree: UnitTestTree;

        beforeAll(async () => {
          const options: ApplicationOptions = {
            name: 'project',
            language: 'js',
            platform: 'express',
          };
          tree = await runner
            .runSchematicAsync('application', options)
            .toPromise();
        });

        it('should generate bootstrap file for express platform', async () => {
          const mainFileContent = tree.readContent(`/project/src/main.js`);

          expect(mainFileContent.trim()).toEqual(
            `
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
`.trim(),
          );
        });
      });

      describe('When providing "fastify" as the platform', () => {
        let tree: UnitTestTree;

        beforeAll(async () => {
          const options: ApplicationOptions = {
            name: 'project',
            language: 'js',
            platform: 'fastify',
          };
          tree = await runner
            .runSchematicAsync('application', options)
            .toPromise();
        });

        it('should generate bootstrap file for fastify platform', async () => {
          const mainFileContent = tree.readContent(`/project/src/main.js`);

          expect(mainFileContent.trim()).toEqual(
            `
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  await app.listen(3000);
}
bootstrap();
`.trim(),
          );
        });
      });
    });
  });
});
