import { join, normalize, Path, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  SchematicsException,
  Source,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { basename, parse } from 'path';
import { formatFiles } from '../../utils/format-files.rule.js';
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting.js';
import {
  DEFAULT_AUTHOR,
  DEFAULT_DESCRIPTION,
  DEFAULT_LANGUAGE,
  DEFAULT_VERSION,
} from '../defaults.js';
import type { ApplicationOptions } from './application.schema.js';

export function main(options: ApplicationOptions): Rule {
  options.name = normalizeToKebabOrSnakeCase(options.name.toString());

  const path =
    !options.directory || options.directory === 'undefined'
      ? options.name
      : options.directory;

  options = transform(options);
  return (host, context) => {
    const existing = keepOrRefuseExistingFiles(host, context, path);
    return chain([
      mergeWith(apply(generate(options, path), [existing])),
      options.minimal
        ? mergeWith(
            apply(generateMinimalSharedFiles(options, path), [existing]),
          )
        : noop(),
      options.format === true ? formatFiles() : noop(),
    ]);
  };
}

/**
 * Existing files the template would also write, but which only document,
 * configure git or instruct an agent rather than build the project, so the
 * user's copy is kept as is.
 */
const KEPT_IF_PRESENT = ['README.md', '.gitignore', 'CLAUDE.md'];

/**
 * `nest new .` usually runs in a folder that already holds something (a spec,
 * a README, `.git`). Files the template doesn't write are left alone, and so
 * is an existing README.md, .gitignore or CLAUDE.md. Any other file the template would
 * write over is a conflict: all of them are reported at once, before anything
 * is written, instead of failing on the first one.
 */
function keepOrRefuseExistingFiles(
  host: Tree,
  context: SchematicContext,
  path: string,
): Rule {
  const root = normalize(`/${path}`);
  const kept = KEPT_IF_PRESENT.map((file) => join(root, file) as string);

  return (generated: Tree) => {
    const conflicts: string[] = [];
    const skipped: string[] = [];
    generated.visit((file) => {
      if (!host.exists(file)) {
        return;
      }
      (kept.includes(file) ? skipped : conflicts).push(file);
    });

    const display = (file: string) =>
      file.slice(root.length).replace(/^\//, '');
    if (conflicts.length > 0) {
      const where = root === '/' ? 'the current directory' : `"${path}"`;
      throw new SchematicsException(
        `Cannot create the application in ${where}: these files already exist and would be overwritten:\n` +
          conflicts
            .sort()
            .map((file) => `  ${display(file)}\n`)
            .join('') +
          'Nothing was written. Move them elsewhere (and back afterwards), or create the application in a directory without them.',
      );
    }
    for (const file of skipped) {
      generated.delete(file);
      context.logger.info(
        `Kept the existing ${display(file)} (the generated one was not written).`,
      );
      // The generated CLAUDE.md only imports AGENTS.md: Claude Code reads
      // CLAUDE.md, not AGENTS.md, so an existing one needs the same line.
      if (
        display(file) === 'CLAUDE.md' &&
        !host.readText(file).includes('@AGENTS.md')
      ) {
        context.logger.info(
          'Add a line "@AGENTS.md" to it, so Claude Code also reads AGENTS.md.',
        );
      }
    }
    return generated;
  };
}

function transform(options: ApplicationOptions): ApplicationOptions {
  const target: ApplicationOptions = Object.assign({}, options);

  target.author = target.author ? target.author : DEFAULT_AUTHOR;
  target.description = target.description
    ? target.description
    : DEFAULT_DESCRIPTION;
  target.language = target.language ? target.language : DEFAULT_LANGUAGE;
  target.name = resolvePackageName(target.name.toString());
  target.version = target.version ? target.version : DEFAULT_VERSION;
  target.type = target.type ?? 'esm';
  // Guarantee the key exists so the templates can branch on it even when the
  // factory is invoked directly, bypassing the schema defaults.
  target.observe = target.observe ?? false;
  target.minimal = target.minimal ?? false;
  // `nest new` repeats a lone target (`--skills=all --skills=all`): the
  // schematics CLI makes an array only from a repeated flag. Each name once.
  const skills: string | string[] = target.skills ?? [];
  target.skills = [
    ...new Set(Array.isArray(skills) ? skills : [skills]),
  ] as ApplicationOptions['skills'];
  target.spec = target.spec ?? true;
  if (target.minimal && target.language !== 'ts') {
    throw new SchematicsException(
      'A minimal application is TypeScript only: JavaScript needs Babel and its own entry file to run decorators, so it would not stay one file.',
    );
  }
  if (target.minimal && target.type !== 'esm') {
    throw new SchematicsException(
      'A minimal application is ESM only (type "esm"): generate a standard application to use CommonJS.',
    );
  }
  target.specFileSuffix = normalizeToKebabOrSnakeCase(
    options.specFileSuffix || 'spec',
  );

  target.packageManager =
    !target.packageManager || target.packageManager === 'undefined'
      ? 'npm'
      : target.packageManager;
  target.dependencies = target.dependencies ? target.dependencies : '';
  target.devDependencies = target.devDependencies ? target.devDependencies : '';
  return target;
}

/**
 * The rules for `name` field defined at https://www.npmjs.com/package/normalize-package-data
 * are the following: the string may not:
 * 1. start with a period.
 * 2. contain the following characters: `/@\s+%`.
 * 3. contain any characters that would need to be encoded for use in URLs.
 * 4. resemble the word `node_modules` or `favicon.ico` (case doesn't matter).
 * but only the rule *1* is addressed by this function as the other ones doesn't
 * have a canonical representation.
 */
function resolvePackageName(path: string) {
  const { base: baseFilename, dir: dirname } = parse(path);
  if (baseFilename === '.') {
    return basename(process.cwd());
  }
  // If is as a package with scope (https://docs.npmjs.com/misc/scope)
  if (dirname.match(/^@[^\s]/)) {
    return `${dirname}/${baseFilename}`;
  }
  return baseFilename;
}

function resolveTemplateDir(options: ApplicationOptions): string {
  if (options.minimal) {
    return 'ts-minimal';
  }
  return options.type === 'esm' && options.language === 'ts'
    ? 'ts-esm'
    : options.language!;
}

function generate(options: ApplicationOptions, path: string): Source {
  const templateDir = resolveTemplateDir(options);

  return apply(url(join('./files' as Path, templateDir)), [
    options.spec
      ? noop()
      : filter((path) => !isTestFile(path, options.language || 'ts')),
    template({
      ...strings,
      ...options,
    }),
    // `package.json` ships as `package.json.template` so that security
    // scanners walking published packages for nested manifests don't
    // attribute the generated app's own license/metadata to
    // `@nestjs/schematics` itself. Restore the real filename here, once the
    // file is on its way into the user's project rather than ours.
    renameTemplateFiles(),
    move(path),
  ]);
}

/**
 * Without specs, the test runner's setup goes too: a config file or an e2e
 * folder with nothing to run reads as an invitation to write tests.
 */
function isTestFile(path: string, languageExtension: string): boolean {
  return (
    path.endsWith(`__specFileSuffix__.${languageExtension}`) ||
    path.startsWith('/test/') ||
    /^\/(jest|vitest)\.config(\.e2e)?\.(ts|js)$/.test(path)
  );
}

/**
 * A minimal application shares these with the standard TypeScript template, so
 * that a change to what agents are told reaches both.
 */
function generateMinimalSharedFiles(
  options: ApplicationOptions,
  path: string,
): Source {
  return apply(url(join('./files' as Path, 'ts')), [
    filter((path) =>
      ['/AGENTS.md', '/CLAUDE.md', '/.gitignore'].includes(path),
    ),
    template({
      ...strings,
      ...options,
    }),
    move(path),
  ]);
}
