import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { isNullOrUndefined } from 'util';
import { normalizeToCase } from '../../utils/formatting';
import {
  DeclarationOptions,
  ModuleDeclarator,
} from '../../utils/module.declarator';
import { ModuleFinder } from '../../utils/module.finder';
import { Location, NameParser } from '../../utils/name.parser';
import { mergeSourceRoot } from '../../utils/source-root.helpers';
import { ServiceOptions } from './service.schema';

export function main(options: ServiceOptions): Rule {
  options = transform(options);
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        mergeSourceRoot(options),
        addDeclarationToModule(options),
        mergeWith(generate(options)),
      ]),
    )(tree, context);
  };
}

function transform(source: ServiceOptions): ServiceOptions {
  const target: ServiceOptions = Object.assign({}, source);
  target.metadata = 'providers';
  target.type = 'service';

  if (isNullOrUndefined(target.name)) {
    throw new SchematicsException('Option (name) is required.');
  }
  const location: Location = new NameParser().parse(target);
  target.name = normalizeToCase(location.name, 'kebab-or-snake');
  target.path = normalizeToCase(location.path, 'kebab-or-snake');
  target.language = target.language !== undefined ? target.language : 'ts';
  target.specFileSuffix = normalizeToCase(
    source.specFileSuffix || 'spec',
    'kebab-or-snake'
  );

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name);
  return target;
}

function generate(options: ServiceOptions) {
  return (context: SchematicContext) =>
    apply(url(join('./files' as Path, options.language)), [
      options.spec
        ? noop()
        : filter((path) => {
            const languageExtension = options.language || 'ts';
            const suffix = `.__specFileSuffix__.${languageExtension}`;
            return !path.endsWith(suffix)
        }),
      template({
        ...strings,
        ...options,
      }),
      move(options.path),
    ])(context);
}

function addDeclarationToModule(options: ServiceOptions): Rule {
  return (tree: Tree) => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree;
    }
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path as Path,
    });
    if (!options.module) {
      return tree;
    }
    const content = tree.read(options.module).toString();
    const declarator: ModuleDeclarator = new ModuleDeclarator();
    tree.overwrite(
      options.module,
      declarator.declare(content, options as DeclarationOptions),
    );
    return tree;
  };
}
