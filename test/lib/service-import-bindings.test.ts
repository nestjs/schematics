import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { ApplicationOptions } from '../../src/lib/application/application.schema.js';
import { compileAndCaptureProviders } from '../helpers/module-import.js';

describe('Service schematic import bindings', () => {
  const runner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  it('generates and registers the actual service when another import owns its name', async () => {
    let tree: UnitTestTree = await runner.runSchematic('application', {
      name: '',
      type: 'cjs',
    } as ApplicationOptions);
    const modulePath = tree.files.find((file) =>
      file.endsWith('/app.module.ts'),
    );
    expect(modulePath).toBeDefined();

    tree.overwrite(
      modulePath!,
      "import { Module } from '@nestjs/common';\n" +
        "import { Other as UsersService } from './other';\n" +
        '@Module({ providers: [] })\nexport class AppModule {}\n',
    );
    tree.create('/src/other.ts', 'export class Other {}\n');
    tree = await runner.runSchematic(
      'service',
      { name: 'users', spec: false },
      tree,
    );
    const service = tree.readContent('/src/users/users.service.ts');
    expect(service).toContain('export class UsersService');
    const content = tree.readContent(modulePath!);
    expect(content).toContain('UsersService as UsersService_1');
    expect(content).toContain('providers: [UsersService_1]');
    const { generatedService, providers } = compileAndCaptureProviders(
      content,
      service,
    );
    expect(providers).toEqual([generatedService]);
  });
});
