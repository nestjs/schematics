import { join, Path, strings } from '@angular-devkit/core';
import { capitalize, classify } from '@angular-devkit/core/src/utils/strings';
import {
  apply,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Source,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as pluralize from 'pluralize';
import { DeclarationOptions, ModuleDeclarator, ModuleFinder } from '../..';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
  NodeDependencyType,
} from '../../utils/dependencies.utils';
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting';
import { Location, NameParser } from '../../utils/name.parser';
import { mergeSourceRoot } from '../../utils/source-root.helpers';
import { ResourceOptions } from './resource.schema';
import { prismaGenerateFields } from './prisma.utils';

import { input, select } from '@inquirer/prompts';

export function main(options: ResourceOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    if (options.crud === 'prisma') {
      const prismaSource = await input({
        message:
          'Please specify the path to the Prisma resource (default is src/api/prisma/).',
        default: 'src/api/prisma/',
      });

      const dtoValidation = await select({
        message: 'Would you like to generate DTO validation?',
        default: 'class-validator',
        choices: [
          { value: 'class-validator', name: 'Class Validator' },
          { value: 'zod', name: 'Zod' },
          { value: 'no', name: 'No DTO validation' },
        ],
      });

      options.prismaSource = prismaSource;
      options.dtoValidation = dtoValidation as 'class-validator' | 'zod' | 'no';
    }
    options = transform(options);
    const prismaOptions = prismaGenerateFields(
      classify(options.name),
      options.dtoValidation,
    );
    options = { ...options, ...prismaOptions };

    return branchAndMerge(
      chain([
        addMappedTypesDependencyIfApplies(options),
        mergeSourceRoot(options),
        addDeclarationToModule(options),
        mergeWith(generate(options)),
      ]),
    )(tree, context) as Rule;
  };
}

function transform(options: ResourceOptions): ResourceOptions {
  const target: ResourceOptions = Object.assign({}, options);
  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }
  target.metadata = 'imports';

  const location: Location = new NameParser().parse(target);
  target.name = normalizeToKebabOrSnakeCase(location.name);
  target.path = normalizeToKebabOrSnakeCase(location.path);
  target.language = target.language !== undefined ? target.language : 'ts';
  if (target.language === 'js') {
    throw new Error(
      'The "resource" schematic does not support JavaScript language (only TypeScript is supported).',
    );
  }
  target.specFileSuffix = normalizeToKebabOrSnakeCase(
    options.specFileSuffix || 'spec',
  );

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name);
  target.isSwaggerInstalled = options.isSwaggerInstalled ?? false;

  return target;
}

function generate(options: ResourceOptions): Source {
  return (context: SchematicContext) =>
    apply(url(join('./files' as Path, options.language)), [
      filter((path) => {
        const possibleCrud = ['yes', 'prisma'];
        if (path.endsWith('.dto.ts')) {
          return (
            options.type !== 'graphql-code-first' &&
            options.type !== 'graphql-schema-first' &&
            possibleCrud.includes(options.crud)
          );
        }
        if (path.endsWith('.input.ts')) {
          return (
            (options.type === 'graphql-code-first' ||
              options.type === 'graphql-schema-first') &&
            possibleCrud.includes(options.crud)
          );
        }
        if (
          path.endsWith('.resolver.ts') ||
          path.endsWith('.resolver.__specFileSuffix__.ts')
        ) {
          return (
            options.type === 'graphql-code-first' ||
            options.type === 'graphql-schema-first'
          );
        }
        if (path.endsWith('.graphql')) {
          return (
            options.type === 'graphql-schema-first' &&
            possibleCrud.includes(options.crud)
          );
        }
        if (
          path.endsWith('controller.ts') ||
          path.endsWith('.controller.__specFileSuffix__.ts')
        ) {
          return options.type === 'microservice' || options.type === 'rest';
        }
        if (
          path.endsWith('.gateway.ts') ||
          path.endsWith('.gateway.__specFileSuffix__.ts')
        ) {
          return options.type === 'ws';
        }
        if (path.includes('@ent')) {
          // Entity class file workaround
          // When an invalid glob path for entities has been specified (on the application part)
          // TypeORM was trying to load a template class
          return possibleCrud.includes(options.crud);
        }
        return true;
      }),
      options.spec
        ? noop()
        : filter((path) => {
            const suffix = `.__specFileSuffix__.ts`;
            return !path.endsWith(suffix);
          }),
      template({
        ...strings,
        ...options,
        lowercased: (name: string) => {
          const classifiedName = classify(name);
          return (
            classifiedName.charAt(0).toLowerCase() + classifiedName.slice(1)
          );
        },
        singular: (name: string) => pluralize.singular(name),
        ent: (name: string) => name + '.entity',
      }),
      move(options.path),
    ])(context);
}

function addDeclarationToModule(options: ResourceOptions): Rule {
  return (tree: Tree) => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree;
    }
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path as Path,
    });
    if (!options.module) {
      return tree;
    }
    const content = tree.read(options.module).toString();
    const declarator: ModuleDeclarator = new ModuleDeclarator();
    tree.overwrite(
      options.module,
      declarator.declare(content, {
        ...options,
        type: 'module',
      } as DeclarationOptions),
    );
    return tree;
  };
}

function addMappedTypesDependencyIfApplies(options: ResourceOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    try {
      if (options.type === 'graphql-code-first') {
        return;
      }
      if (options.type === 'rest') {
        const nodeDependencyRef = getPackageJsonDependency(
          host,
          '@nestjs/swagger',
        );
        if (nodeDependencyRef) {
          options.isSwaggerInstalled = true;
          return;
        }
      }
      const nodeDependencyRef = getPackageJsonDependency(
        host,
        '@nestjs/mapped-types',
      );
      if (!nodeDependencyRef) {
        addPackageJsonDependency(host, {
          type: NodeDependencyType.Default,
          name: '@nestjs/mapped-types',
          version: '*',
        });
        context.addTask(new NodePackageInstallTask());
      }
    } catch (err) {
      // ignore if "package.json" not found
    }
  };
}
