import { join, normalize, Path, strings } from '@angular-devkit/core';
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
import { DeclarationOptions, ModuleDeclarator } from '../../utils/module.declarator';
import { ModuleFinder } from '../../utils/module.finder';
import { Location, NameParser } from '../../utils/name.parser';
import { ControllerOptions } from './controller.schema';

const DEFAULT_PATH_NAME = 'src';
const DEFAULT_LANGUAGE = 'ts';

const ELEMENT_METADATA = 'controllers';
const ELEMENT_TYPE = 'controller';

export function main(options: ControllerOptions): Rule {
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

function transform(source: ControllerOptions): ControllerOptions {
  const target: ControllerOptions = Object.assign({}, source);
  target.metadata = ELEMENT_METADATA;
  target.type = ELEMENT_TYPE;
  target.path = target.path !== undefined ?
    join(normalize(DEFAULT_PATH_NAME), target.path) : normalize(DEFAULT_PATH_NAME);
  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.path = join(strings.dasherize(location.path) as Path, target.name);
  target.language = target.language !== undefined ? target.language : DEFAULT_LANGUAGE;
  return target;
}

function generate(options: ControllerOptions) {
  return apply(
    url(join('../../templates' as Path, options.language, 'controller')), [
      template({
        ...strings,
        ...options
      }),
      move(options.path)
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
    const content = tree.read(options.module).toString();
    const declarator: ModuleDeclarator = new ModuleDeclarator();
    tree.overwrite(options.module, declarator.declare(content, options as DeclarationOptions));
    return tree;
  };
}
