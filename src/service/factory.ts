import { basename, dirname, join, normalize, Path, relative, strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import {
  apply, branchAndMerge, chain, mergeWith, move, Rule, SchematicContext, template, Tree,
  url
} from '@angular-devkit/schematics';
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';
import { ModuleFinder } from '../utils/module.finder';
import { ServiceOptions } from './schema';
import { Location, NameParser } from '../utils/name.parser';
import { PathSolver } from '../utils/path.solver';

export function main(options: ServiceOptions): Rule {
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

function generate(options: ServiceOptions) {
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
    const symbol: string = `${ classify(options.name) }Service`;
    content = ModuleImportUtils.insert(content, symbol, computeRelativePath(options));
    content = ModuleMetadataUtils.insert(content, 'components', symbol);
    tree.overwrite(options.module, content);
    return tree;
  };
}

function computeRelativePath(options: ServiceOptions): string {
  const importModulePath: Path = normalize(`/${ options.path }/${options.name}/${ options.name }.service`);
  return new PathSolver().relative(options.module, importModulePath);
}
