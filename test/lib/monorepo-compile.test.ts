import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as ts from 'typescript';
import type { ApplicationOptions } from '../../src/lib/application/application.schema.js';

/**
 * These tests compile a generated workspace with the real TypeScript compiler
 * instead of asserting on the JSON the schematics write. The `rootDir`,
 * `outDir` and path-alias values only matter through what `tsc` does with
 * them, and the failures they guard against (`TS6059`, `TS6307`, `TS2307` on
 * an alias) are invisible to a JSON assertion.
 *
 * The generated sources import `@nestjs/common` and friends, which are not
 * installed in this repo, so every check ignores unresolved bare specifiers
 * that are not workspace aliases. Nothing else is filtered.
 */

/** Diagnostics that mean `rootDir` does not cover the program's files. */
const ROOT_DIR_CODES = new Set([
  6059, // File is not under 'rootDir'
  6307, // File is not listed within the file list of project
  5011, // The common source directory must be explicitly set (TS6+)
]);

const CANNOT_FIND_MODULE = 2307;

/**
 * Raised because `@types/node`, `@types/jest` and `vitest` are not installed
 * here, not because of anything the generated config does.
 */
const MISSING_TYPE_PACKAGE_CODES = new Set([
  2688, // Cannot find type definition file for '<pkg>'
  2591, // Cannot find name 'process'. Do you need to install @types/node?
  2580, // Cannot find name 'require'/'module'. Do you need @types/node?
]);

interface CompileResult {
  diagnostics: string[];
  emitted: string[];
}

const tempDirs: string[] = [];

function materialize(tree: UnitTestTree): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nest-monorepo-'));
  tempDirs.push(dir);
  for (const file of tree.files) {
    const dest = path.join(dir, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, tree.readContent(file));
  }
  return dir;
}

function write(dir: string, relativePath: string, contents: string): void {
  const dest = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contents);
}

function patchJson(
  dir: string,
  relativePath: string,
  mutate: (json: any) => void,
): void {
  const dest = path.join(dir, relativePath);
  const json = JSON.parse(fs.readFileSync(dest, 'utf-8'));
  mutate(json);
  fs.writeFileSync(dest, JSON.stringify(json, null, 2));
}

/**
 * Type-checks and emits one project, capturing the emitted paths rather than
 * writing them, so a test can assert the output layout without touching disk.
 */
function compile(dir: string, tsconfigRelativePath: string): CompileResult {
  const configPath = path.join(dir, tsconfigRelativePath);
  const host: ts.ParseConfigFileHost = {
    ...ts.sys,
    getCurrentDirectory: () => dir,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
      );
    },
  };
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, host);
  if (!parsed) {
    throw new Error(`Could not read ${tsconfigRelativePath}`);
  }

  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
    projectReferences: parsed.projectReferences,
  });

  const emitted: string[] = [];
  const emitResult = program.emit(undefined, (fileName) => {
    emitted.push(path.relative(dir, fileName).split(path.sep).join('/'));
  });

  const all = [
    ...parsed.errors,
    ...ts.getPreEmitDiagnostics(program),
    ...emitResult.diagnostics,
  ];

  const diagnostics = all
    .filter((diagnostic) => !isMissingExternalPackage(diagnostic))
    .map(
      (diagnostic) =>
        `TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          ' ',
        )}`,
    );

  return { diagnostics, emitted: emitted.sort() };
}

/**
 * True for "cannot find module '@nestjs/core'" and the like: packages this
 * repo does not install. An unresolved `@app/*` alias is a real failure and is
 * deliberately not filtered.
 */
function isMissingExternalPackage(diagnostic: ts.Diagnostic): boolean {
  if (MISSING_TYPE_PACKAGE_CODES.has(diagnostic.code)) {
    return true;
  }
  if (diagnostic.code !== CANNOT_FIND_MODULE) {
    return false;
  }
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
  return !message.includes('@app/');
}

const rootDirErrors = (result: CompileResult): string[] =>
  result.diagnostics.filter((message) =>
    ROOT_DIR_CODES.has(Number(message.slice(2, message.indexOf(':')))),
  );

const jsOutputs = (result: CompileResult): string[] =>
  result.emitted.filter((file) => file.endsWith('.js'));

/** The app name derived from this repo's own package.json name. */
const WORKSPACE_APP = 'nestjs-schematics';

describe('Generated monorepo compiles', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );

  const app = (type: 'esm' | 'cjs'): Promise<UnitTestTree> =>
    runner.runSchematic('application', {
      name: '',
      type,
    } as ApplicationOptions);

  const addLibrary = (tree: UnitTestTree, name: string) =>
    runner.runSchematic('library', { name, prefix: '@app' }, tree);

  const addApp = (tree: UnitTestTree, name: string) =>
    runner.runSchematic('sub-app', { name }, tree);

  /**
   * `moveDefaultAppToApps` is a no-op under NODE_ENV=test, so the original
   * app's sources stay at the workspace root and `apps/<workspace>` is left
   * holding nothing but its tsconfig. Do the move here, otherwise every check
   * against the workspace app compiles an empty program and passes for the
   * wrong reason.
   */
  function moveWorkspaceApp(dir: string, appName: string): void {
    for (const directory of ['src', 'test']) {
      const from = path.join(dir, directory);
      if (!fs.existsSync(from)) {
        continue;
      }
      const to = path.join(dir, 'apps', appName, directory);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.renameSync(from, to);
    }
  }

  /** A workspace with two libraries and a sub-app, written to a temp dir. */
  async function workspace(type: 'esm' | 'cjs'): Promise<string> {
    let tree = await app(type);
    tree = await addLibrary(tree, 'shared');
    tree = await addLibrary(tree, 'other');
    tree = await addApp(tree, 'admin');
    const dir = materialize(tree);
    moveWorkspaceApp(dir, WORKSPACE_APP);
    return dir;
  }

  /** `import { SharedModule } from '@app/shared'` in the given project. */
  function importSharedFrom(dir: string, relativeDirPath: string): void {
    write(
      dir,
      `${relativeDirPath}/uses-shared.ts`,
      "import { SharedModule } from '@app/shared';\nexport const used = SharedModule;\n",
    );
  }

  afterAll(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  describe.each(['esm', 'cjs'] as const)('%s workspace', (type) => {
    it('should resolve a library alias from a sub-app', async () => {
      const dir = await workspace(type);
      importSharedFrom(dir, 'apps/admin/src');

      const result = compile(dir, 'apps/admin/tsconfig.app.json');

      expect(result.diagnostics).toEqual([]);
    });

    it('should resolve a library alias from the moved workspace app', async () => {
      const dir = await workspace(type);
      importSharedFrom(dir, `apps/${WORKSPACE_APP}/src`);

      const result = compile(dir, `apps/${WORKSPACE_APP}/tsconfig.app.json`);

      expect(result.diagnostics).toEqual([]);
    });

    it('should resolve a library alias from another library', async () => {
      const dir = await workspace(type);
      importSharedFrom(dir, 'libs/other/src');

      const result = compile(dir, 'libs/other/tsconfig.lib.json');

      expect(result.diagnostics).toEqual([]);
    });

    it('should build a library on its own', async () => {
      const dir = await workspace(type);

      const result = compile(dir, 'libs/shared/tsconfig.lib.json');

      expect(result.diagnostics).toEqual([]);
    });

    it('should emit the sub-app without repeating the project path', async () => {
      const dir = await workspace(type);

      const result = compile(dir, 'apps/admin/tsconfig.app.json');

      expect(jsOutputs(result)).toContain('dist/apps/admin/src/main.js');
      expect(
        jsOutputs(result).some((file) => file.includes('apps/admin/apps/')),
      ).toBe(false);
    });

    it('should emit a library without repeating the project path', async () => {
      const dir = await workspace(type);

      const result = compile(dir, 'libs/shared/tsconfig.lib.json');

      expect(jsOutputs(result)).toContain('dist/libs/shared/src/index.js');
      expect(
        jsOutputs(result).some((file) => file.includes('libs/shared/libs/')),
      ).toBe(false);
    });

    it('should emit a consumed library beside the app, not inside it', async () => {
      const dir = await workspace(type);
      importSharedFrom(dir, 'apps/admin/src');

      const result = compile(dir, 'apps/admin/tsconfig.app.json');

      // The library is pulled into the app's program by the alias, so it is
      // emitted too - at the path the library's own build would use, which is
      // what makes a shared `dist` safe to overwrite.
      expect(jsOutputs(result)).toContain('dist/libs/shared/src/index.js');
    });

    it('should emit the moved workspace app under its own project path', async () => {
      const dir = await workspace(type);

      const result = compile(
        dir,
        `apps/${WORKSPACE_APP}/tsconfig.app.json`,
      );

      expect(jsOutputs(result)).toContain(
        `dist/apps/${WORKSPACE_APP}/src/main.js`,
      );
    });

    it('should emit each project into a disjoint part of the shared dist', async () => {
      const dir = await workspace(type);

      const admin = jsOutputs(compile(dir, 'apps/admin/tsconfig.app.json'));
      const workspaceApp = jsOutputs(
        compile(dir, `apps/${WORKSPACE_APP}/tsconfig.app.json`),
      );
      const shared = jsOutputs(compile(dir, 'libs/shared/tsconfig.lib.json'));

      expect(admin.length).toBeGreaterThan(0);
      expect(workspaceApp.length).toBeGreaterThan(0);
      expect(shared.length).toBeGreaterThan(0);

      // Nothing is dropped in the root of `dist` either, which would collide
      // with a sibling project's entry file.
      for (const file of [...admin, ...workspaceApp, ...shared]) {
        expect(file.split('/').length).toBeGreaterThan(2);
      }
      expect(admin.filter((file) => workspaceApp.includes(file))).toEqual([]);
      expect(admin.filter((file) => shared.includes(file))).toEqual([]);
    });

    it('should not emit declarations for applications', async () => {
      const dir = await workspace(type);

      const result = compile(dir, 'apps/admin/tsconfig.app.json');

      expect(result.emitted.filter((f) => f.endsWith('.d.ts'))).toEqual([]);
    });

    it('should emit declarations for libraries', async () => {
      const dir = await workspace(type);

      const result = compile(dir, 'libs/shared/tsconfig.lib.json');

      expect(result.emitted).toContain('dist/libs/shared/src/index.d.ts');
    });

    it('should keep spec files out of the build', async () => {
      const dir = await workspace(type);

      const result = compile(dir, 'libs/shared/tsconfig.lib.json');

      expect(
        result.emitted.some((file) => /\.(spec|test)\.js$/.test(file)),
      ).toBe(false);
    });
  });

  describe('start:prod', () => {
    it('should name the entry file a tsc build actually emits', async () => {
      let tree = await app('esm');
      // The conversion always writes rspack, so the builder is pinned
      // afterwards and a second app rewrites the script against it.
      tree = await addApp(tree, 'first');
      const cli = JSON.parse(tree.readContent('/nest-cli.json'));
      cli.compilerOptions.builder = 'tsc';
      tree.overwrite('/nest-cli.json', JSON.stringify(cli, null, 2));
      tree = await addApp(tree, 'second');

      const dir = materialize(tree);
      moveWorkspaceApp(dir, WORKSPACE_APP);
      const script = JSON.parse(
        fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'),
      ).scripts['start:prod'];
      const entry = script.replace(/^node /, '');

      const result = compile(dir, `apps/${WORKSPACE_APP}/tsconfig.app.json`);

      // `node dist/apps/x/src/main` resolves `main.js`; assert the build put
      // one there, so the script and the layout cannot drift apart.
      expect(jsOutputs(result)).toContain(`${entry}.js`);
    });
  });

  /**
   * The two settings this change turns on are only load-bearing under a
   * failure that is easy to reintroduce, so each is pinned by reverting it and
   * asserting the error comes back.
   */
  describe('regression guards', () => {
    it('should fail to resolve an ESM alias that names a directory', async () => {
      const dir = await workspace('esm');
      importSharedFrom(dir, 'apps/admin/src');
      patchJson(dir, 'tsconfig.json', (json) => {
        json.compilerOptions.paths['@app/shared'] = ['./libs/shared/src'];
      });

      const result = compile(dir, 'apps/admin/tsconfig.app.json');

      expect(
        result.diagnostics.some(
          (message) =>
            message.startsWith(`TS${CANNOT_FIND_MODULE}:`) &&
            message.includes('@app/shared'),
        ),
      ).toBe(true);
    });

    it('should resolve a CommonJS alias that names a directory', async () => {
      const dir = await workspace('cjs');
      importSharedFrom(dir, 'apps/admin/src');

      // The CommonJS alias is left pointing at the directory on purpose;
      // directory-index resolution still applies there.
      const paths = JSON.parse(
        fs.readFileSync(path.join(dir, 'tsconfig.json'), 'utf-8'),
      ).compilerOptions.paths;
      expect(paths['@app/shared']).toEqual(['./libs/shared/src']);

      expect(compile(dir, 'apps/admin/tsconfig.app.json').diagnostics).toEqual(
        [],
      );
    });

    it('should reject a project rootDir that excludes sibling sources', async () => {
      const dir = await workspace('esm');
      importSharedFrom(dir, 'apps/admin/src');
      patchJson(dir, 'apps/admin/tsconfig.app.json', (json) => {
        json.compilerOptions.rootDir = './src';
      });

      const result = compile(dir, 'apps/admin/tsconfig.app.json');

      expect(rootDirErrors(result).length).toBeGreaterThan(0);
    });

    it('should require an explicit rootDir', async () => {
      const dir = await workspace('esm');
      patchJson(dir, 'libs/shared/tsconfig.lib.json', (json) => {
        delete json.compilerOptions.rootDir;
      });

      const result = compile(dir, 'libs/shared/tsconfig.lib.json');

      expect(rootDirErrors(result).length).toBeGreaterThan(0);
    });

    it('should repeat the project path if outDir names the project', async () => {
      const dir = await workspace('esm');
      patchJson(dir, 'apps/admin/tsconfig.app.json', (json) => {
        json.compilerOptions.outDir = '../../dist/apps/admin';
      });

      const result = compile(dir, 'apps/admin/tsconfig.app.json');

      expect(jsOutputs(result)).toContain(
        'dist/apps/admin/apps/admin/src/main.js',
      );
    });
  });
});
