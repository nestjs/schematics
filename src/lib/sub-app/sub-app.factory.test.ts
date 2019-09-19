import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { SubAppOptions } from './sub-app.schema';

describe('SubApp Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', () => {
    const options: SubAppOptions = {
      name: 'project',
    };
    const tree: UnitTestTree = runner.runSchematic('app', options);
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/apps/main/tsconfig.app.json',
      '/apps/main/tslint.json',
      '/apps/project/tsconfig.app.json',
      '/apps/project/tslint.json',
      '/apps/project/src/app.controller.spec.ts',
      '/apps/project/src/app.controller.ts',
      '/apps/project/src/app.module.ts',
      '/apps/project/src/app.service.ts',
      '/apps/project/src/main.ts',
      '/apps/project/test/app.e2e-spec.ts',
      '/apps/project/test/jest-e2e.json',
    ]);
  });
  it('should manage name to dasherize', () => {
    const options: SubAppOptions = {
      name: 'awesomeProject',
    };
    const tree: UnitTestTree = runner.runSchematic('app', options);
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/apps/main/tsconfig.app.json',
      '/apps/main/tslint.json',
      '/apps/awesome-project/tsconfig.app.json',
      '/apps/awesome-project/tslint.json',
      '/apps/awesome-project/src/app.controller.spec.ts',
      '/apps/awesome-project/src/app.controller.ts',
      '/apps/awesome-project/src/app.module.ts',
      '/apps/awesome-project/src/app.service.ts',
      '/apps/awesome-project/src/main.ts',
      '/apps/awesome-project/test/app.e2e-spec.ts',
      '/apps/awesome-project/test/jest-e2e.json',
    ]);
  });
  it('should manage javascript files', () => {
    const options: SubAppOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = runner.runSchematic('app', options);
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/apps/main/.babelrc',
      '/apps/main/index.js',
      '/apps/main/jsconfig.json',
      '/apps/project/.babelrc',
      '/apps/project/index.js',
      '/apps/project/jsconfig.json',
      '/apps/project/src/app.controller.js',
      '/apps/project/src/app.controller.spec.js',
      '/apps/project/src/app.module.js',
      '/apps/project/src/app.service.js',
      '/apps/project/src/main.js',
      '/apps/project/test/app.e2e-spec.js',
      '/apps/project/test/jest-e2e.json',
    ]);
  });
});
