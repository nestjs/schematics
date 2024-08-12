import { join, Path, strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
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
import { Project } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const prismaClientPath = path.resolve(
  __dirname,
  'node_modules/@prisma/client/index.d.ts',
);

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

project.addSourceFileAtPath(prismaClientPath);

const sourceFile = project.getSourceFile('index.d.ts');

export function main(options: ResourceOptions): Rule {
  options = transform(options);

  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        addMappedTypesDependencyIfApplies(options),
        mergeSourceRoot(options),
        addDeclarationToModule(options),
        mergeWith(generate(options)),
      ]),
    )(tree, context);
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
        prismaFields: getModelFields(options.name),
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

// Function to get Prisma model fields
function getModelFields(modelName: string) {
  const modelInterface = sourceFile
    .getInterfaceOrThrow(`Prisma.${modelName}`)
    .getType();

  return modelInterface.getProperties().map((prop) => {
    const name = prop.getName();
    const type = prop.getValueDeclarationOrThrow().getType().getText();

    return {
      name,
      type,
    };
  });
}

// Function to map Prisma types to class-validator decorators
function getValidationDecorator(type: string) {
  switch (type) {
    case 'string':
      return '@IsString()';
    case 'number':
      return '@IsNumber()';
    case 'boolean':
      return '@IsBoolean()';
    case 'Date':
      return '@IsDate()';
    default:
      return '';
  }
}

// Function to generate DTO content
function generateDtoContent(
  modelName: string,
  fields: { name: string; type: string }[],
) {
  let dtoContent = `import { IsString, IsInt, IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';\n\n`;
  dtoContent += `export class Create${modelName}Dto {\n`;

  fields.forEach(({ name, type }) => {
    const validationDecorator = getValidationDecorator(type);
    dtoContent += `  ${validationDecorator}\n`;
    dtoContent += `  readonly ${name}: ${type};\n\n`;
  });

  dtoContent += `}`;

  return dtoContent;
}

// Example usage to generate DTOs for the 'User' model
const modelName = 'User';
const fields = getModelFields(modelName);
const dtoContent = generateDtoContent(modelName, fields);
