import { EmptyTree, Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { LibraryOptions } from './library.schema.js';

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

  it('should generate spec files with custom suffix', async () => {
    const options: LibraryOptions = {
      name: 'project',
      prefix: 'app',
      specFileSuffix: 'test',
    };
    const tree: UnitTestTree = await runner.runSchematic('library', options);

    const files: string[] = tree.files;
    expect(files).toEqual([
      '/nest-cli.json',
      '/libs/project/tsconfig.lib.json',
      '/libs/project/src/index.ts',
      '/libs/project/src/project.module.ts',
      '/libs/project/src/project.service.test.ts',
      '/libs/project/src/project.service.ts',
    ]);

    const tsconfigLib = tree.readJson('/libs/project/tsconfig.lib.json');
    expect(tsconfigLib['exclude']).toContain('**/*test.ts');
  });

  it('should set rspack as default builder in nest-cli.json', async () => {
    const options: LibraryOptions = {
      name: 'project',
      prefix: 'app',
    };
    const tree: UnitTestTree = await runner.runSchematic('library', options);

    const config = tree.readJson('/nest-cli.json');
    expect(config['compilerOptions']['builder']).toEqual('rspack');
  });

  it('should not overwrite existing builder in nest-cli.json', async () => {
    const options: LibraryOptions = {
      name: 'project',
      prefix: 'app',
    };

    let tree: Tree = new EmptyTree();
    tree.create(
      '/nest-cli.json',
      JSON.stringify({ compilerOptions: { builder: 'webpack' } }),
    );
    tree.create('/package.json', `{"name": "test", "version": "1.0.0"}`);
    tree.create('/tsconfig.json', `{"compilerOptions": {}}`);

    tree = await runner.runSchematic('library', options, tree);

    const config = tree.readJson('/nest-cli.json');
    expect(config['compilerOptions']['builder']).toEqual('webpack');
  });

  it('should add paths to tsconfig.json', async () => {
    const options: LibraryOptions = {
      name: 'project',
      prefix: 'app',
    };

    let tree: Tree = new EmptyTree();
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          target: 'ES2023',
        },
      }),
    );

    tree = await runner.runSchematic('library', options, tree);

    const tsconfig = tree.readJson('/tsconfig.json');
    expect(tsconfig['compilerOptions']['baseUrl']).toEqual('./');
    expect(tsconfig['compilerOptions']['paths']['app/project']).toEqual([
      './libs/project/src',
    ]);
    expect(tsconfig['compilerOptions']['paths']['app/project/*']).toEqual([
      './libs/project/src/*',
    ]);
    // Other compiler options should be preserved
    expect(tsconfig['compilerOptions']['target']).toEqual('ES2023');
  });

  it('should add paths when adding library to existing project', async () => {
    let tree: Tree = new EmptyTree();
    tree.create('/nest-cli.json', JSON.stringify({ projects: {} }));
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          baseUrl: './',
          paths: {},
        },
      }),
    );
    tree.create('/package.json', `{"name": "test", "version": "1.0.0"}`);

    tree = await runner.runSchematic(
      'library',
      { name: 'my-lib', prefix: 'app' } as LibraryOptions,
      tree,
    );

    const tsconfig = tree.readJson('/tsconfig.json');
    expect(tsconfig['compilerOptions']['baseUrl']).toEqual('./');
    expect(tsconfig['compilerOptions']['paths']['app/my-lib']).toEqual([
      './libs/my-lib/src',
    ]);
    expect(tsconfig['compilerOptions']['paths']['app/my-lib/*']).toEqual([
      './libs/my-lib/src/*',
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
      },
    ];

    let tree: Tree = new EmptyTree();
    tree.create(
      '/package.json',
      `{"name": "my-pacakge","version": "1.0.0","jest": {}}`,
    );
    tree.create('/tsconfig.json', `{"compilerOptions": {}}`);
    tree.create('/test/jest-e2e.json', `{}`);

    for (const o of options) {
      tree = await runner.runSchematic('library', o, tree);
    }

    const packageJson = tree.readJson('/package.json');
    const moduleNameMapper = packageJson['jest']['moduleNameMapper'];
    expect(Object.keys(moduleNameMapper)).toEqual([
      '^app/a(|/.*)$',
      '^app/b(|/.*)$',
      '^app/c(|/.*)$',
    ]); // Sorted jest.moduleNameMapper by keys
    expect(moduleNameMapper).toEqual({
      '^app/a(|/.*)$': '<rootDir>/libs/a/src/$1',
      '^app/b(|/.*)$': '<rootDir>/libs/b/src/$1',
      '^app/c(|/.*)$': '<rootDir>/libs/c/src/$1',
    }); // Check package.json moduleNameMapper values

    const jestE2EJson = tree.readJson('/test/jest-e2e.json');
    const e2eModuleNameMapper = jestE2EJson['moduleNameMapper'];
    expect(Object.keys(e2eModuleNameMapper)).toEqual([
      '^app/a(|/.*)$',
      '^app/b(|/.*)$',
      '^app/c(|/.*)$',
    ]); // Sorted jest-e2e.json moduleNameMapper by keys
    expect(e2eModuleNameMapper).toEqual({
      '^app/a(|/.*)$': '<rootDir>/../libs/a/src/$1',
      '^app/b(|/.*)$': '<rootDir>/../libs/b/src/$1',
      '^app/c(|/.*)$': '<rootDir>/../libs/c/src/$1',
    }); // Check jest-e2e.json moduleNameMapper values with different root path

    const tsConfigJson = tree.readJson('/tsconfig.json');
    const paths = tsConfigJson['compilerOptions']['paths'];
    expect(Object.keys(paths)).toEqual([
      'app/a',
      'app/a/*',
      'app/b',
      'app/b/*',
      'app/c',
      'app/c/*',
    ]); // Sorted paths by keys

    const config = tree.readJson('/nest-cli.json');
    expect(Object.keys(config['projects'])).toEqual(['a', 'b', 'c']); // Sorted
  });

  it('should generate files with .js imports for ESM projects', async () => {
    let tree: Tree = new EmptyTree();
    tree.create(
      '/package.json',
      JSON.stringify({ name: 'test', type: 'module' }),
    );
    tree.create('/tsconfig.json', JSON.stringify({ compilerOptions: {} }));

    const options: LibraryOptions = { name: 'project', prefix: 'app' };
    tree = await runner.runSchematic('library', options, tree);

    // Spec file should have .js import
    const specContent = tree.readContent(
      '/libs/project/src/project.service.spec.ts',
    );
    expect(specContent).toContain(
      "import { ProjectService } from './project.service.js'",
    );

    // Non-spec files should have .js imports
    const moduleContent = tree.readContent(
      '/libs/project/src/project.module.ts',
    );
    expect(moduleContent).toContain(
      "import { ProjectService } from './project.service.js'",
    );

    const indexContent = tree.readContent('/libs/project/src/index.ts');
    expect(indexContent).toContain("export * from './project.module.js'");
    expect(indexContent).toContain("export * from './project.service.js'");
  });
});
