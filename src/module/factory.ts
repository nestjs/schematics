import { join, Path, strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import {
  apply, branchAndMerge, chain, mergeWith, move, Rule, SchematicContext, Source, template, Tree,
  url
} from '@angular-devkit/schematics';
import { ModuleFindUtils } from '../utils/module-find.utils';
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';
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
    const symbol: string = `${ classify(options.name) }Module`;

    const generatedDirectoryPath: string = join('/src' as Path, options.path);
    console.log('generatedDirectoryPath : ', generatedDirectoryPath);
    const moduleToInsertPath: string = ModuleFindUtils.find(tree, generatedDirectoryPath);
    console.log('moduleToInsertPath     : ', moduleToInsertPath);

    const relativePath: string = `./${ options.name }/${ options.name }.module`;
    let content = tree.read('/src/app.module.ts').toString();
    content = ModuleImportUtils.insert(content, symbol, relativePath);
    content = ModuleMetadataUtils.insert(content, 'imports', symbol);
    tree.overwrite('/src/app.module.ts', content);
    return tree;
  };
}
