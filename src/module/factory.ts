import { join, normalize, Path, strings } from '@angular-devkit/core';
import { capitalize, classify } from '@angular-devkit/core/src/utils/strings';
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
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';
import { ModuleFinder } from '../utils/module.finder';
import { Location, NameParser } from '../utils/name.parser';
import { PathSolver } from '../utils/path.solver';
import { ModuleOptions } from './schema';

export function main(options: ModuleOptions): Rule {
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

function transform(source: ModuleOptions): ModuleOptions {
  let target: ModuleOptions = Object.assign({}, source);
  target.metadata = 'imports';
  target.type = 'module';
  target.path = target.path !== undefined ? join(normalize('src'), target.path) : normalize('src');
  const location: Location = new NameParser().parse(target);
  target.name = location.name;
  target.path = location.path;
  return target;
}

function generate(options: ModuleOptions) {
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

function addDeclarationToModule(options: ModuleOptions): Rule {
  return (tree: Tree) => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree;
    }
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path as Path
    });
    let content = tree.read(options.module).toString();
    const symbol: string = `${ classify(options.name) }${ capitalize(options.type) }`;
    content = ModuleImportUtils.insert(content, symbol, computeRelativePath(options));
    content = ModuleMetadataUtils.insert(content, options.metadata, symbol);
    tree.overwrite(options.module, content);
    return tree;
  };
}

function computeRelativePath(options: ModuleOptions): string {
  const importModulePath: Path = normalize(`/${ options.path }/${options.name}/${ options.name }.${ options.type }`);
  return new PathSolver().relative(options.module, importModulePath);
}
