import { join, normalize, Path, strings } from '@angular-devkit/core';
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
  url
} from '@angular-devkit/schematics';
import { DeclarationOptions, ModuleDeclarator } from '../utils/module.declarator';
import { ModuleFinder } from '../utils/module.finder';
import { Location, NameParser } from '../utils/name.parser';
import { ServiceOptions } from './schema';
import { dasherize } from '@angular-devkit/core/src/utils/strings';

export function main(options: ServiceOptions): Rule {
  options = transform(options);
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        addDeclarationToModule(options),
        mergeWith(generate(options))
      ])
    )(tree, context);
  };
}

function transform(source: ServiceOptions): ServiceOptions {
  let target: ServiceOptions = Object.assign({}, source);
  target.metadata = 'components';
  target.type = 'service';
  target.path = target.path !== undefined ? join(normalize('src'), target.path) : normalize('src');
  const location: Location = new NameParser().parse(target);
  target.name = location.name;
  target.path = location.path;
  return target;
}

function generate(options: ServiceOptions) {
  return apply(
    url('./files'), [
      template({
        ...strings,
        ...options
      }),
      move(join(options.path as Path, dasherize(options.name)))
    ]
  );
}

function addDeclarationToModule(options: ServiceOptions): Rule {
  return (tree: Tree) => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree;
    }
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path as Path
    });
    let content = tree.read(options.module).toString();
    const declarator: ModuleDeclarator = new ModuleDeclarator();
    tree.overwrite(options.module, declarator.declare(content, options as DeclarationOptions));
    return tree;
  };
}
