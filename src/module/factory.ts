import { strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import {
  apply, branchAndMerge, chain, mergeWith, move, Rule, SchematicContext, Source, template, Tree,
  url
} from '@angular-devkit/schematics';
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';
import { ModuleFinder } from '../utils/module.finder';
import { ModuleOptions } from './schema';

export function main(options: ModuleOptions): Rule {
  options.path = options.path !== undefined ? options.path : options.name;
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        addDeclarationToModule(options),
        mergeWith(generate(options))
      ]))(tree, context);
  };
}

function generate(options: ModuleOptions): Source {
  return apply(
    url('./files'), [
      template({
        ...strings,
        ...options
      }),
      move('src')
    ]
  );
}

function addDeclarationToModule(options: ModuleOptions): Rule {
  return (tree: Tree) => {
    const finder: ModuleFinder = new ModuleFinder(tree);
    const moduleToInsertPath: string = finder.find({
      name: options.name,
      path: options.path,
      kind: 'module'
    });
    const relativePath: string = `./${ options.name }/${ options.name }.module`;
    let content = tree.read(moduleToInsertPath).toString();
    const symbol: string = `${ classify(options.name) }Module`;
    content = ModuleImportUtils.insert(content, symbol, relativePath);
    content = ModuleMetadataUtils.insert(content, 'imports', symbol);
    tree.overwrite(moduleToInsertPath, content);
    return tree;
  };
}
