import { EmptyTree, Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { SubAppOptions } from './sub-app.schema.js';

describe('SubApp Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: SubAppOptions = {
      name: 'project',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/tsconfig.app.json',
        '/apps/project/tsconfig.app.json',
        '/apps/project/src/main.ts',
        '/apps/project/src/project.controller.spec.ts',
        '/apps/project/src/project.controller.ts',
        '/apps/project/src/project.module.ts',
        '/apps/project/src/project.service.ts',
        '/apps/project/test/app.e2e-spec.ts',
        '/apps/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should manage name to normalize', async () => {
    const options: SubAppOptions = {
      name: 'awesomeProject',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/tsconfig.app.json',
        '/apps/awesome-project/tsconfig.app.json',
        '/apps/awesome-project/src/main.ts',
        '/apps/awesome-project/src/awesome-project.controller.spec.ts',
        '/apps/awesome-project/src/awesome-project.controller.ts',
        '/apps/awesome-project/src/awesome-project.module.ts',
        '/apps/awesome-project/src/awesome-project.service.ts',
        '/apps/awesome-project/test/app.e2e-spec.ts',
        '/apps/awesome-project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it("should keep underscores in sub-app's path and file name", async () => {
    const options: SubAppOptions = {
      name: '_project',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/tsconfig.app.json',
        '/apps/_project/tsconfig.app.json',
        '/apps/_project/src/main.ts',
        '/apps/_project/src/_project.controller.spec.ts',
        '/apps/_project/src/_project.controller.ts',
        '/apps/_project/src/_project.module.ts',
        '/apps/_project/src/_project.service.ts',
        '/apps/_project/test/app.e2e-spec.ts',
        '/apps/_project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should manage javascript files', async () => {
    const options: SubAppOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/.babelrc',
        '/apps/nestjs-schematics/index.js',
        '/apps/nestjs-schematics/jsconfig.json',
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
      ].sort(),
    );
  });
  it('should generate spec files with custom suffix', async () => {
    const options: SubAppOptions = {
      name: 'project',
      specFileSuffix: 'test',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/tsconfig.app.json',
        '/apps/project/tsconfig.app.json',
        '/apps/project/src/main.ts',
        '/apps/project/src/project.controller.test.ts',
        '/apps/project/src/project.controller.ts',
        '/apps/project/src/project.module.ts',
        '/apps/project/src/project.service.ts',
        '/apps/project/test/jest-e2e.json',
        '/apps/project/test/app.e2e-test.ts',
      ].sort(),
    );
  });

  it('should set rspack as default builder in nest-cli.json', async () => {
    const options: SubAppOptions = {
      name: 'project',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const config = tree.readJson('/nest-cli.json');
    expect(config['compilerOptions']['builder']).toEqual('rspack');
  });

  it('should convert tsconfig.json to solution-style with project references', async () => {
    const options: SubAppOptions = {
      name: 'project',
    };

    let tree: Tree = new EmptyTree();
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          baseUrl: './',
          paths: { '@app/*': ['src/*'] },
          target: 'ES2023',
        },
        include: ['src'],
      }),
    );

    tree = await runner.runSchematic('sub-app', options, tree);

    const tsconfig = tree.readJson('/tsconfig.json');
    // Should be converted to solution-style
    expect(tsconfig['files']).toEqual([]);
    expect(tsconfig['include']).toBeUndefined();
    expect(tsconfig['exclude']).toBeUndefined();
    // baseUrl and paths should be removed
    expect(tsconfig['compilerOptions']['baseUrl']).toBeUndefined();
    expect(tsconfig['compilerOptions']['paths']).toBeUndefined();
    // Other compiler options should be preserved
    expect(tsconfig['compilerOptions']['target']).toEqual('ES2023');
    // Should have references to both apps
    expect(tsconfig['references']).toEqual([
      { path: './apps/nestjs-schematics/tsconfig.app.json' },
      { path: './apps/project/tsconfig.app.json' },
    ]);
  });

  it('should add project reference when adding sub-app to existing monorepo', async () => {
    let tree: Tree = new EmptyTree();
    tree.create(
      '/nest-cli.json',
      JSON.stringify({ monorepo: true, projects: {} }),
    );
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {},
        files: [],
        references: [{ path: './apps/existing-app/tsconfig.app.json' }],
      }),
    );

    tree = await runner.runSchematic(
      'sub-app',
      { name: 'new-app' } as SubAppOptions,
      tree,
    );

    const tsconfig = tree.readJson('/tsconfig.json');
    expect(tsconfig['references']).toEqual([
      { path: './apps/existing-app/tsconfig.app.json' },
      { path: './apps/nestjs-schematics/tsconfig.app.json' },
      { path: './apps/new-app/tsconfig.app.json' },
    ]);
  });

  it('should sort sub-app names in nest-cli.json', async () => {
    const options: SubAppOptions[] = [
      {
        name: 'c',
        language: 'ts',
      },
      {
        name: 'a',
        language: 'ts',
      },
      {
        name: 'b',
        language: 'ts',
      },
    ];

    let tree: Tree = new EmptyTree();
    tree.create('/nest-cli.json', `{"monorepo": true, "projects": {}}`);

    for (const o of options) {
      tree = await runner.runSchematic('sub-app', o, tree);
    }

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

    const options: SubAppOptions = { name: 'project' };
    tree = await runner.runSchematic('sub-app', options, tree);

    // Spec file should have .js imports
    const specContent = tree.readContent(
      '/apps/project/src/project.controller.spec.ts',
    );
    expect(specContent).toContain(
      "import { ProjectController } from './project.controller.js'",
    );
    expect(specContent).toContain(
      "import { ProjectService } from './project.service.js'",
    );

    // Non-spec files should have .js imports
    const moduleContent = tree.readContent(
      '/apps/project/src/project.module.ts',
    );
    expect(moduleContent).toContain(
      "import { ProjectController } from './project.controller.js'",
    );
    expect(moduleContent).toContain(
      "import { ProjectService } from './project.service.js'",
    );

    const controllerContent = tree.readContent(
      '/apps/project/src/project.controller.ts',
    );
    expect(controllerContent).toContain(
      "import { ProjectService } from './project.service.js'",
    );

    const mainContent = tree.readContent('/apps/project/src/main.ts');
    expect(mainContent).toContain(
      "import { ProjectModule } from './project.module.js'",
    );
  });
});
