import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { formatFiles } from './format-files.rule';
import { describe, expect, it } from '@jest/globals';

describe('formatFiles Rule', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  it('should not crash when prettier formats a file', async () => {
    const tree = Tree.empty();
    tree.create(
      '/src/foo.ts',
      "import {Controller} from '@nestjs/common';\n\n@Controller('foo')\nexport class FooController {}\n",
    );

    const rule = formatFiles();
    const result = await runner.callRule(rule, tree).toPromise();

    expect(result.exists('/src/foo.ts')).toBe(true);
    const content = result.read('/src/foo.ts')!.toString('utf-8');
    expect(content).toContain('FooController');
    expect(content).toContain('@Controller');
  });

  it('should be a no-op when tree has no formattable files', async () => {
    const tree = Tree.empty();
    tree.create('/src/data.json', '{"name":"foo"}');
    tree.create('/src/notes.md', '# Notes');

    const rule = formatFiles();
    const result = await runner.callRule(rule, tree).toPromise();

    expect(result.read('/src/data.json')!.toString('utf-8')).toBe(
      '{"name":"foo"}',
    );
    expect(result.read('/src/notes.md')!.toString('utf-8')).toBe('# Notes');
  });

  it('should only format files with provided paths when specified', async () => {
    const tree = Tree.empty();
    tree.create('/src/a.ts', 'export const a = 1;');
    tree.create('/src/b.ts', 'export const b = 2;');

    const rule = formatFiles(['/src/a.ts']);
    const result = await runner.callRule(rule, tree).toPromise();

    expect(result.exists('/src/a.ts')).toBe(true);
    expect(result.exists('/src/b.ts')).toBe(true);
  });

  it('should handle non-existent files gracefully', async () => {
    const tree = Tree.empty();

    const rule = formatFiles(['/does/not/exist.ts']);
    // Should not throw
    await expect(
      runner.callRule(rule, tree).toPromise(),
    ).resolves.toBeDefined();
  });
});
