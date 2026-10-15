import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { ApplicationOptions } from '../../src/lib/application/application.schema.js';

describe('Service schematic import transaction', () => {
  const runner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  it('does not apply module edits or generated files when generation fails', async () => {
    const tree: UnitTestTree = await runner.runSchematic('application', {
      name: '',
      type: 'cjs',
    } as ApplicationOptions);
    const modulePath = tree.files.find((file) =>
      file.endsWith('/app.module.ts'),
    );
    expect(modulePath).toBeDefined();

    const existingServicePath = '/src/users/users.service.ts';
    tree.create(existingServicePath, 'export class ExistingService {}\n');
    const originalFiles = [...tree.files];
    const originalModule = tree.readContent(modulePath!);

    await expect(
      runner.runSchematic('service', { name: 'users' }, tree),
    ).rejects.toThrow();

    expect(tree.readContent(modulePath!)).toBe(originalModule);
    expect(tree.files).toEqual(originalFiles);
    expect(tree.readContent(existingServicePath)).toBe(
      'export class ExistingService {}\n',
    );
  });
});
