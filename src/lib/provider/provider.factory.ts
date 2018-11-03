import { join, normalize, Path, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  DeclarationOptions,
  ModuleDeclarator,
} from '../../utils/module.declarator';
import { ModuleFinder } from '../../utils/module.finder';
import { Location, NameParser } from '../../utils/name.parser';
import { DEFAULT_PATH_NAME } from '../defaults';
import { ProviderOptions } from './provider.schema';

export function main(options: ProviderOptions): Rule {
  options = transform(options);
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([addDeclarationToModule(options), mergeWith(generate(options))]),
    )(tree, context);
  };
}

function transform(options: ProviderOptions): ProviderOptions {
  const target: ProviderOptions = Object.assign({}, options);
  target.metadata = 'providers';

  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }

  const defaultSourceRoot =
    options.sourceRoot !== undefined ? options.sourceRoot : DEFAULT_PATH_NAME;
  target.path =
    target.path !== undefined
      ? join(normalize(defaultSourceRoot), target.path)
      : normalize(defaultSourceRoot);

  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.path = strings.dasherize(location.path);
  target.language = target.language !== undefined ? target.language : 'ts';
  return target;
}

function generate(options: ProviderOptions) {
  return apply(url(join('./files' as Path, options.language)), [
    template({
      ...strings,
      ...options,
    }),
    move(options.path),
  ]);
}

function addDeclarationToModule(options: ProviderOptions): Rule {
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
      declarator.declare(content, options as DeclarationOptions),
    );
    return tree;
  };
}
