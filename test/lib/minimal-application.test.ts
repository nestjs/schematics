import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { ApplicationOptions } from '../../src/lib/application/application.schema.js';

describe('Generating into a minimal application', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  const app = (
    extra: Partial<ApplicationOptions> = {},
  ): Promise<UnitTestTree> =>
    runner.runSchematic('application', {
      name: '',
      minimal: true,
      ...extra,
    } as ApplicationOptions);

  const generate = (
    schematic: string,
    name: string,
    tree: UnitTestTree,
    extra: Record<string, unknown> = {},
  ) => runner.runSchematic(schematic, { name, spec: false, ...extra }, tree);

  it('should register a resource in the module in main.ts', async () => {
    const tree = await generate('resource', 'users', await app(), {
      crud: true,
      type: 'rest',
    });
    const main = tree.readContent('/src/main.ts');

    expect(main).toContain(
      "import { UsersModule } from './users/users.module.js';\n",
    );
    expect(main).toContain(
      '  controllers: [AppController],\n  providers: [AppService],\n  imports: [UsersModule],\n',
    );
  });

  it('should register a module in the module in main.ts', async () => {
    const tree = await generate('module', 'users', await app());
    const main = tree.readContent('/src/main.ts');

    expect(main).toContain(
      "import { UsersModule } from './users/users.module.js';\n",
    );
    expect(main).toContain('imports: [UsersModule]');
  });

  it('should register a controller in the module in main.ts', async () => {
    const tree = await generate('controller', 'users', await app());
    const main = tree.readContent('/src/main.ts');

    expect(main).toContain(
      "import { UsersController } from './users/users.controller.js';\n",
    );
    expect(main).toContain('controllers: [AppController, UsersController]');
  });

  it('should register a service in the module in main.ts', async () => {
    const tree = await generate('service', 'users', await app());
    const main = tree.readContent('/src/main.ts');

    expect(main).toContain(
      "import { UsersService } from './users/users.service.js';\n",
    );
    expect(main).toContain('providers: [AppService, UsersService]');
  });

  it('should keep imports above the code when observe is set up', async () => {
    const tree = await generate(
      'module',
      'users',
      await app({ observe: true }),
    );
    const main = tree.readContent('/src/main.ts');

    expect(main.indexOf('./users/users.module.js')).toBeLessThan(
      main.indexOf('createObserveModule();'),
    );
    expect(main).toMatch(/\}\),\n\s+UsersModule,?\n\s+\],/);
  });

  it('should use the module next to a generated element once there is one', async () => {
    const withModule = await generate('module', 'users', await app());
    const tree = await generate('controller', 'users', withModule);

    expect(tree.readContent('/src/users/users.module.ts')).toContain(
      'controllers: [UsersController]',
    );
    expect(tree.readContent('/src/main.ts')).not.toContain('UsersController');
  });

  it('should use a root module file once AppModule has moved out of main.ts', async () => {
    const tree = await app();
    tree.create(
      '/src/app.module.ts',
      "import { Module } from '@nestjs/common';\n\n@Module({})\nexport class AppModule {}\n",
    );
    const grown = await generate('controller', 'users', tree);

    expect(grown.readContent('/src/app.module.ts')).toContain(
      'controllers: [UsersController]',
    );
    expect(grown.readContent('/src/main.ts')).not.toContain('UsersController');
  });

  it('should warn when no module can take the generated element', async () => {
    const warnings: string[] = [];
    const subscription = runner.logger.subscribe((entry) => {
      if (entry.level === 'warn') {
        warnings.push(entry.message);
      }
    });
    const tree = await app();
    tree.overwrite('/src/main.ts', "console.log('no module here');\n");

    await generate('controller', 'users', tree);
    subscription.unsubscribe();

    expect(warnings).toEqual([
      expect.stringContaining('No module found to register "users"'),
    ]);
    expect(warnings[0]).toContain('--skip-import');
  });

  it('should not warn when told not to import', async () => {
    const warnings: string[] = [];
    const subscription = runner.logger.subscribe((entry) => {
      if (entry.level === 'warn') {
        warnings.push(entry.message);
      }
    });

    await generate('controller', 'users', await app(), { skipImport: true });
    subscription.unsubscribe();

    expect(warnings).toEqual([]);
  });
});
