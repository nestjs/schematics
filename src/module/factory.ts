import { basename, dirname, normalize, Path, relative, strings } from '@angular-devkit/core';
import {
  apply, chain, mergeWith, move, Rule, SchematicContext, Source, template, Tree,
  url
} from '@angular-devkit/schematics';
import { ModuleOptions } from './schema';
import { classify } from '@angular-devkit/core/src/utils/strings';
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';

export function main(options: ModuleOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      mergeWith(generate(options)),
      addDeclarationToModule(options)
    ])(tree, context);
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
    const relativePath: string = `./${ options.name }/${ options.name }.module`;
    let content = tree.read('/src/app.module.ts').toString();
    content = ModuleImportUtils.insert(content, symbol, relativePath);
    content = ModuleMetadataUtils.insert(content, symbol);
    tree.overwrite('/src/app.module.ts', content);
    return tree;
  };
}
