import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { LibraryOptions } from './library.schema';

describe('Library Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', () => {
    const options: LibraryOptions = {
      name: 'project',
    };
    const tree: UnitTestTree = runner.runSchematic('library', options);
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/projects/project/.gitignore',
      '/projects/project/package.json',
      '/projects/project/tsconfig.json',
      '/projects/project/tsconfig.spec.json',
      '/projects/project/tslint.json',
      '/projects/project/src/index.ts',
      '/projects/project/src/project.module.ts',
      '/projects/project/src/project.service.spec.ts',
      '/projects/project/src/project.service.ts',
    ]);
  });
  it('should manage name to dasherize', () => {
    const options: LibraryOptions = {
      name: 'awesomeProject',
    };
    const tree: UnitTestTree = runner.runSchematic('library', options);
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/projects/awesome-project/.gitignore',
      '/projects/awesome-project/package.json',
      '/projects/awesome-project/tsconfig.json',
      '/projects/awesome-project/tsconfig.spec.json',
      '/projects/awesome-project/tslint.json',
      '/projects/awesome-project/src/index.ts',
      '/projects/awesome-project/src/awesome-project.module.ts',
      '/projects/awesome-project/src/awesome-project.service.spec.ts',
      '/projects/awesome-project/src/awesome-project.service.ts',
    ]);
  });
  it('should manage javascript files', () => {
    const options: LibraryOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = runner.runSchematic('library', options);
    const files: string[] = tree.files;
    expect(files).toEqual([
      '/projects/project/.babelrc',
      '/projects/project/.gitignore',
      '/projects/project/jsconfig.json',
      '/projects/project/package.json',
       '/projects/project/src/index.js',
      '/projects/project/src/project.module.js',
      '/projects/project/src/project.service.js',
      '/projects/project/src/project.service.spec.js',
    ]);
  });
});
