import { basename, dirname, normalize, Path, relative, strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';
import { ModuleFinder } from '../utils/module.finder';
import { ServiceOptions } from './schema';

export function main(options: ServiceOptions): Rule {
  options.path = options.path !== undefined ? options.path : options.name;
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

function addDeclarationToModule(options: ServiceOptions): Rule {
  return (tree: Tree) => {
    const finder: ModuleFinder = new ModuleFinder(tree);
    const moduleToInsertPath: Path = finder.find({
      name: options.name,
      path: options.path,
      kind: 'service'
    });
    let content = tree.read(moduleToInsertPath).toString();
    const symbol: string = `${ classify(options.name) }Service`;
    content = ModuleImportUtils.insert(content, symbol, computeRelativePath(options, moduleToInsertPath));
    content = ModuleMetadataUtils.insert(content, 'components', symbol);
    tree.overwrite(moduleToInsertPath, content);
    return tree;
  };
}

function computeRelativePath(options: ServiceOptions, moduleToInsertPath: Path): string {
  const importModulePath: Path = normalize(`/src/${ options.path }/${ options.name }.service`);
  const relativeDir: Path = relative(dirname(moduleToInsertPath), dirname(importModulePath));
  return (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir)
    .concat(relativeDir.length === 0 ? basename(importModulePath) : '/' + basename(importModulePath));
}
