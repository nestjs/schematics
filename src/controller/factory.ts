import { join, normalize, Path, strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import {
  apply, branchAndMerge, chain, mergeWith, move, Rule, SchematicContext, template, Tree,
  url
} from '@angular-devkit/schematics';
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';
import { ModuleFinder } from '../utils/module.finder';
import { Location, NameParser } from '../utils/name.parser';
import { PathSolver } from '../utils/path.solver';
import { ControllerOptions } from './schema';

export function main(options: ControllerOptions): Rule {
  options.path = options.path !== undefined ? join(normalize('src'), options.path) : normalize('src');
  const location: Location = new NameParser().parse(options);
  options.name = location.name;
  options.path = location.path;
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        addDeclarationToModule(options),
        mergeWith(generate(options))
      ])
    )(tree, context);
  };
}

function generate(options: ControllerOptions) {
  return apply(
    url('./files'), [
      template({
        ...strings,
        ...options
      }),
      move(join(options.path as Path, options.name))
    ]
  );
}

function addDeclarationToModule(options: ControllerOptions): Rule {
  return (tree: Tree) => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree;
    }
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path as Path
    });
    let content = tree.read(options.module).toString();
    const symbol: string = `${ classify(options.name) }Controller`;
    content = ModuleImportUtils.insert(content, symbol, computeRelativePath(options));
    content = ModuleMetadataUtils.insert(content, 'controllers', symbol);
    tree.overwrite(options.module, content);
    return tree;
  };
}

function computeRelativePath(options: ControllerOptions): string {
  const importModulePath: Path = normalize(`/${ options.path }/${options.name}/${ options.name }.controller`);
  return new PathSolver().relative(options.module, importModulePath);
}
