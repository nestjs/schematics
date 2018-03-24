import { basename, dirname, normalize, Path, relative, strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import {
  apply, branchAndMerge, chain, mergeWith, move, Rule, SchematicContext, template, Tree,
  url
} from '@angular-devkit/schematics';
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';
import { ModuleFinder } from '../utils/module.finder';
import { ServiceOptions } from './schema';

export function main(options: ServiceOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    options.path = options.path !== undefined ? options.path : options.name;
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path,
      kind: 'service'
    });
    return branchAndMerge(
      chain([
        addDeclarationToModule(options),
        mergeWith(generate(options))
      ])
    )(tree, context);
  };
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

function addDeclarationToModule(options: ServiceOptions): Rule {
  return (tree: Tree) => {
    let content = tree.read(options.module).toString();
    const symbol: string = `${ classify(options.name) }Service`;
    content = ModuleImportUtils.insert(content, symbol, computeRelativePath(options));
    content = ModuleMetadataUtils.insert(content, 'components', symbol);
    tree.overwrite(options.module, content);
    return tree;
  };
}

function computeRelativePath(options: ServiceOptions): string {
  const importModulePath: Path = normalize(`/src/${ options.path }/${ options.name }.service`);
  const relativeDir: Path = relative(dirname(options.module), dirname(importModulePath));
  return (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir)
    .concat(relativeDir.length === 0 ? basename(importModulePath) : '/' + basename(importModulePath));
}
