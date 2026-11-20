import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  SchematicsException,
  Source,
  template,
  url,
} from '@angular-devkit/schematics';
import { readdirSync, readFileSync, statSync } from 'fs';
import { createRequire } from 'module';
import { basename, join as joinPath, parse, sep } from 'path';
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
  return chain([
    mergeWith(generate(options, path)),
    options.minimal
      ? mergeWith(generateMinimalSharedFiles(options, path))
      : noop(),
    addAgentSkills(options, path),
    options.format === true ? formatFiles() : noop(),
  ]);
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
  target.skills = target.skills ?? ['all'];
  for (const name of target.skills) {
    if (!(name in SKILLS_TARGETS) && !(name in SKILLS_GROUPS)) {
      throw new SchematicsException(
        `Unknown skills target "${name}": use ${[...Object.keys(SKILLS_TARGETS), ...Object.keys(SKILLS_GROUPS)].join(', ')}, or none.`,
      );
    }
  }
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
      : filter((path) => {
          const languageExtension = options.language || 'ts';
          const suffix = `__specFileSuffix__.${languageExtension}`;
          return !path.endsWith(suffix);
        }),
    template({
      ...strings,
      ...options,
      skillsTargets: skillsTargets(options),
      SKILLS_TARGETS,
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
 * Where agents load project skills from, under the names the installer of
 * `@nestjs/skills` uses for them (`npx @nestjs/skills add --agent <name>`):
 * Codex reads only `.agents/skills/`, Claude Code only `.claude/skills/`, and
 * Cursor all three.
 */
const SKILLS_TARGETS: Record<string, string> = {
  agents: '.agents/skills',
  claude: '.claude/skills',
  cursor: '.cursor/skills',
};
const SKILLS_GROUPS: Record<string, string[]> = { all: ['agents', 'claude'] };

/** The targets the `skills` option names, `all` expanded, each once. */
function skillsTargets(options: ApplicationOptions): string[] {
  const names = (options.skills ?? []).flatMap(
    (name) => SKILLS_GROUPS[name] ?? [name],
  );
  return [...new Set(names)].sort();
}

/**
 * Copies the official NestJS agent skills from the `@nestjs/skills` package
 * these schematics depend on into each chosen target. An agent loads a skill
 * when its description matches the task, so the pitfalls the skills hold cost
 * nothing until they apply, unlike AGENTS.md, which is read on every task.
 * A new `@nestjs/skills` release reaches new projects without a release of the
 * schematics. Each skill folder gets the marker the package's installer
 * writes, so `npx @nestjs/skills add` can update it later and `remove` can
 * remove it. The files are copied byte for byte, without the template step.
 */
function addAgentSkills(options: ApplicationOptions, path: string): Rule {
  const targets = skillsTargets(options);
  if (targets.length === 0) {
    return noop();
  }
  return async (tree) => {
    let skills: { name: string; dir: string }[];
    let version: string;
    try {
      const { listSkills } = await import('@nestjs/skills');
      skills = listSkills();
      version = JSON.parse(
        readFileSync(
          createRequire(import.meta.url).resolve('@nestjs/skills/package.json'),
          'utf8',
        ),
      ).version;
    } catch {
      throw new SchematicsException(
        "@nestjs/skills is missing, so the NestJS agent skills can't be added. Reinstall @nestjs/schematics, or set skills to an empty list to skip them.",
      );
    }
    const marker = `${JSON.stringify({ package: '@nestjs/skills', version })}\n`;
    for (const target of targets) {
      for (const skill of skills) {
        const dest = join(path as Path, SKILLS_TARGETS[target], skill.name);
        const files = (readdirSync(skill.dir, { recursive: true }) as string[])
          .map((file) => file.split(sep).join('/'))
          .filter((file) => statSync(joinPath(skill.dir, file)).isFile())
          .sort();
        for (const file of files) {
          tree.create(
            join(dest, file),
            readFileSync(joinPath(skill.dir, file)),
          );
        }
        tree.create(join(dest, '.nestjs-skills'), marker);
      }
    }
  };
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
    filter((path) => ['/AGENTS.md', '/.gitignore'].includes(path)),
    template({
      ...strings,
      ...options,
      skillsTargets: skillsTargets(options),
      SKILLS_TARGETS,
    }),
    move(path),
  ]);
}
