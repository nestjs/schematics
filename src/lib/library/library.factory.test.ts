import { EmptyTree, Tree } from '@angular-devkit/schematics';
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
  it('should manage name only', async () => {
    const options: LibraryOptions = {
      name: 'project',
      prefix: 'app',
    };
    const tree: UnitTestTree = await runner.runSchematic('library', options);

    const files: string[] = tree.files;
    expect(files).toEqual([
      '/nest-cli.json',
      '/libs/project/tsconfig.lib.json',
      '/libs/project/src/index.ts',
      '/libs/project/src/project.module.ts',
      '/libs/project/src/project.service.spec.ts',
      '/libs/project/src/project.service.ts',
    ]);
  });
  it('should manage name to normalize', async () => {
    const options: LibraryOptions = {
      name: 'awesomeProject',
      prefix: 'app',
    };
    const tree: UnitTestTree = await runner.runSchematic('library', options);

    const files: string[] = tree.files;
    expect(files).toEqual([
      '/nest-cli.json',
      '/libs/awesome-project/tsconfig.lib.json',
      '/libs/awesome-project/src/index.ts',
      '/libs/awesome-project/src/awesome-project.module.ts',
      '/libs/awesome-project/src/awesome-project.service.spec.ts',
      '/libs/awesome-project/src/awesome-project.service.ts',
    ]);
  });
  it("should keep underscores in library's path and file name", async () => {
    const options: LibraryOptions = {
      name: '_project',
      prefix: 'app',
    };
    const tree: UnitTestTree = await runner.runSchematic('library', options);

    const files: string[] = tree.files;
    expect(files).toEqual([
      '/nest-cli.json',
      '/libs/_project/tsconfig.lib.json',
      '/libs/_project/src/index.ts',
      '/libs/_project/src/_project.module.ts',
      '/libs/_project/src/_project.service.spec.ts',
      '/libs/_project/src/_project.service.ts',
    ]);
  });
  it('should manage javascript files', async () => {
    const options: LibraryOptions = {
      name: 'project',
      language: 'js',
      prefix: 'app',
    };
    const tree: UnitTestTree = await runner.runSchematic('library', options);

    const files: string[] = tree.files;
    expect(files).toEqual([
      '/nest-cli.json',
      '/libs/project/.babelrc',
      '/libs/project/jsconfig.json',
      '/libs/project/src/index.js',
      '/libs/project/src/project.module.js',
      '/libs/project/src/project.service.js',
      '/libs/project/src/project.service.spec.js',
    ]);
  });

  it('should sort library names in nest-cli.json, package.json and tsconfig.json', async () => {
    const options: LibraryOptions[] = [
      {
        name: 'c',
        language: 'ts',
        prefix: 'app',
      },
      {
        name: 'a',
        language: 'ts',
        prefix: 'app',
      },
      {
        name: 'b',
        language: 'ts',
        prefix: 'app',
      }
    ];

    let tree: Tree = new EmptyTree();
    tree.create('/package.json', `{"name": "my-pacakge","version": "1.0.0","jest": {}}`);
    tree.create('/tsconfig.json', `{compilerOptions: {}}`);


    for (const o of options) {
      tree = await runner.runSchematic('library', o, tree);
    }

    const packageJson = tree.readJson('/package.json');
    const moduleNameMapper = packageJson['jest']['moduleNameMapper'];
    expect(Object.keys(moduleNameMapper)).toEqual([
      '^app/a(|/.*)$',
      '^app/b(|/.*)$',
      '^app/c(|/.*)$'
    ]); // Sorted jest.moduleNameMapper by keys

    const tsConfigJson = tree.readJson('/tsconfig.json');
    const paths = tsConfigJson['compilerOptions']['paths'];
    expect(Object.keys(paths)).toEqual([
      'app/a',
      'app/a/*',
      'app/b',
      'app/b/*',
      'app/c',
      'app/c/*'
    ]); // Sorted compilerOptions.paths by keys

    const config = tree.readJson('/nest-cli.json');
    expect(Object.keys(config['projects'])).toEqual(['a', 'b', 'c']); // Sorted
  });
});
