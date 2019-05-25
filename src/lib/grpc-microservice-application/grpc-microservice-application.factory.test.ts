import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { GrpcMicroserviceApplicationOptions } from './grpc-microservice-application.schema';

const SCHEMATICS_NAME: string = 'grpc-microservice-application';

describe('GRPC Microservice Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', () => {
    const options: GrpcMicroserviceApplicationOptions = {
      name: 'project',
    };
    const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/project/.gitignore',
      '/project/.prettierrc',
      '/project/README.md',
      '/project/nest-cli.json',
      '/project/nodemon-debug.json',
      '/project/nodemon.json',
      '/project/package.json',
      '/project/tsconfig.build.json',
      '/project/tsconfig.json',
      '/project/tslint.json',
      '/project/proto/hero.proto',
      '/project/src/app.module.ts',
      '/project/src/hero.controller.spec.ts',
      '/project/src/hero.controller.ts',
      '/project/src/main.ts',
      '/project/test/app.e2e-spec.ts',
      '/project/test/jest-e2e.json',
      '/project/test/client/client.module.ts',
      '/project/test/client/index.ts',
      '/project/test/client/heroes/heroes.controller.ts',
      '/project/test/client/heroes/heroes.module.ts',
      '/project/test/client/heroes/heroes.service.ts',
      '/project/test/client/heroes/index.ts',
    ]);
  });
  it('should manage name to dasherize', () => {
    const options: GrpcMicroserviceApplicationOptions = {
      name: 'awesomeProject',
    };
    const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/awesome-project/.gitignore',
      '/awesome-project/.prettierrc',
      '/awesome-project/README.md',
      '/awesome-project/nest-cli.json',
      '/awesome-project/nodemon-debug.json',
      '/awesome-project/nodemon.json',
      '/awesome-project/package.json',
      '/awesome-project/tsconfig.build.json',
      '/awesome-project/tsconfig.json',
      '/awesome-project/tslint.json',
      '/awesome-project/proto/hero.proto',
      '/awesome-project/src/app.module.ts',
      '/awesome-project/src/hero.controller.spec.ts',
      '/awesome-project/src/hero.controller.ts',
      '/awesome-project/src/main.ts',
      '/awesome-project/test/app.e2e-spec.ts',
      '/awesome-project/test/jest-e2e.json',
      '/awesome-project/test/client/client.module.ts',
      '/awesome-project/test/client/index.ts',
      '/awesome-project/test/client/heroes/heroes.controller.ts',
      '/awesome-project/test/client/heroes/heroes.module.ts',
      '/awesome-project/test/client/heroes/heroes.service.ts',
      '/awesome-project/test/client/heroes/index.ts',
    ]);
  });
  it('should manage javascript files', () => {
    const options: GrpcMicroserviceApplicationOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = runner.runSchematic(SCHEMATICS_NAME, options);
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/project/.babelrc',
      '/project/.gitignore',
      '/project/.prettierrc',
      '/project/README.md',
      '/project/index.js',
      '/project/jsconfig.json',
      '/project/nest-cli.json',
      '/project/nodemon.json',
      '/project/package.json',
      '/project/proto/hero.proto',
      '/project/src/app.module.js',
      '/project/src/hero.controller.js',
      '/project/src/hero.controller.spec.js',
      '/project/src/main.js',
      '/project/test/app.e2e-spec.js',
      '/project/test/jest-e2e.json',
      '/project/test/client/client.module.js',
      '/project/test/client/index.js',
      '/project/test/client/heroes/heroes.controller.js',
      '/project/test/client/heroes/heroes.module.js',
      '/project/test/client/heroes/index.js',
    ]);
  });
});
