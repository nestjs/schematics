import { basename, dirname, normalize, Path, relative, strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Source,
  template,
  Tree,
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
    const moduleToInsertPath: Path = finder.find({
      name: options.name,
      path: options.path,
      kind: 'module'
    });
    const relativePath: string = computeRelativePath(options, moduleToInsertPath);
    let content = tree.read(moduleToInsertPath).toString();
    const symbol: string = `${ classify(options.name) }Module`;
    content = ModuleImportUtils.insert(content, symbol, relativePath);
    content = ModuleMetadataUtils.insert(content, 'imports', symbol);
    tree.overwrite(moduleToInsertPath, content);
    return tree;
  };
}

function computeRelativePath(options: ModuleOptions, moduleToInsertPath: Path): string {
  const importModulePath: Path = normalize(`/src/${ options.path }/${ options.name }.module`);
  const relativeDir: Path = relative(dirname(moduleToInsertPath), dirname(importModulePath));
  return (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir)
    .concat(relativeDir.length === 0 ? basename(importModulePath) : '/' + basename(importModulePath));
}
