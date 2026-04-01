import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting.js';
import {
  DeclarationOptions,
  ModuleDeclarator,
} from '../../utils/module.declarator.js';
import { ModuleFinder } from '../../utils/module.finder.js';
import { Location, NameParser } from '../../utils/name.parser.js';
import {
  isEsmProject,
  mergeSourceRoot,
} from '../../utils/source-root.helpers.js';
import type { ModuleOptions } from './module.schema.js';

export function main(options: ModuleOptions): Rule {
  options = transform(options);
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        mergeSourceRoot(options),
        addDeclarationToModule(options),
        mergeWith(generate(options)),
      ]),
    )(tree, context);
  };
}

function transform(source: ModuleOptions): ModuleOptions {
  const target: ModuleOptions = Object.assign({}, source);
  target.metadata = 'imports';
  target.type = 'module';

  const location: Location = new NameParser().parse(target);
  target.name = normalizeToKebabOrSnakeCase(location.name);
  target.path = normalizeToKebabOrSnakeCase(location.path);
  target.language = target.language !== undefined ? target.language : 'ts';

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name);
  return target;
}

function generate(options: ModuleOptions) {
  return (context: SchematicContext) =>
    apply(url(join('./files' as Path, options.language!)), [
      template({
        ...strings,
        ...options,
      }),
      move(options.path!),
    ])(context);
}

function addDeclarationToModule(options: ModuleOptions): Rule {
  return (tree: Tree) => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree;
    }
    options.module =
      new ModuleFinder(tree).find({
        name: options.name,
        path: options.path as Path,
      }) ?? undefined;
    if (!options.module) {
      return tree;
    }
    const content = tree.read(options.module)!.toString();
    const declarator: ModuleDeclarator = new ModuleDeclarator();
    tree.overwrite(
      options.module,
      declarator.declare(content, {
        ...options,
        isEsm: isEsmProject(tree),
      } as DeclarationOptions),
    );
    return tree;
  };
}
