import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { MqttMicroserviceApplicationOptions } from './mqtt-microservice-application.schema';

const SCHEMATICS_NAME: string = 'mqtt-microservice-application';

describe('MQTT Microservice Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', () => {
    const options: MqttMicroserviceApplicationOptions = {
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
      '/project/src/app.module.ts',
      '/project/src/main.ts',
      '/project/src/math.controller.spec.ts',
      '/project/src/math.controller.ts',
      '/project/test/app.e2e-spec.ts',
      '/project/test/jest-e2e.json',
      '/project/test/mocks/index.ts',
      '/project/test/mocks/mqtt.ts',
    ]);
  });
  it('should manage name to dasherize', () => {
    const options: MqttMicroserviceApplicationOptions = {
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
      '/awesome-project/src/app.module.ts',
      '/awesome-project/src/main.ts',
      '/awesome-project/src/math.controller.spec.ts',
      '/awesome-project/src/math.controller.ts',
      '/awesome-project/test/app.e2e-spec.ts',
      '/awesome-project/test/jest-e2e.json',
      '/awesome-project/test/mocks/index.ts',
      '/awesome-project/test/mocks/mqtt.ts',
    ]);
  });
  it('should manage javascript files', () => {
    const options: MqttMicroserviceApplicationOptions = {
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
      '/project/src/app.module.js',
      '/project/src/main.js',
      '/project/src/math.controller.js',
      '/project/src/math.controller.spec.js',
      '/project/test/app.e2e-spec.js',
      '/project/test/jest-e2e.json',
      '/project/test/mocks/index.js',
      '/project/test/mocks/mqtt.js',
    ]);
  });
});
