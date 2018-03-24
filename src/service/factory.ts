import { strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleOptions } from '../module/schema';
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';
import { ServiceOptions } from './schema';

export function main(options: ServiceOptions): Rule {
  return chain([
    mergeWith(generate(options)),
    addDeclarationToModule(options)
  ]);
}

function generate(options: ServiceOptions) {
  return apply(
    url('./files'), [
      template({
        ...strings,
        ...options
      }),
      move('/src')
    ]
  );
}

function addDeclarationToModule(options: ModuleOptions): Rule {
  return (tree: Tree) => {
    const symbol: string = `${ classify(options.name) }Service`;
    const relativePath: string = `./${ options.name }/${ options.name }.service`;
    let content = tree.read('/src/app.module.ts').toString();
    content = ModuleImportUtils.insert(content, symbol, relativePath);
    content = ModuleMetadataUtils.insert(content, 'components', symbol);
    tree.overwrite('/src/app.module.ts', content);
    return tree;
  };
}
