import { strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  externalSchematic,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { join } from 'path';
import { Path } from 'typescript';
import {
  DeclarationOptions,
  ModuleDeclarator,
} from '../../../utils/module.declarator';
import { ModuleFinder } from '../../../utils/module.finder';
import { Location, NameParser } from '../../../utils/name.parser';
import { mergeSourceRoot } from '../../../utils/source-root.helpers';
import { ModuleOptions } from '../../module/module.schema';
import { AngularOptions } from './angular.schema';

export function main(options: AngularOptions): Rule {
  options = transform(options);
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        createAngularApplication(options),
        mergeSourceRoot(options),
        addDeclarationToModule(options),
        addGlobalPrefix(),
        mergeWith(generate(options)),
      ]),
    )(tree, context);
  };
}

function transform(source: AngularOptions): ModuleOptions {
  const target: AngularOptions = Object.assign({}, source);
  target.directory = target.name ? strings.dasherize(target.name) : 'client';
  target.name = 'Angular';
  target.metadata = 'imports';
  target.type = 'module';

  const location: Location = new NameParser().parse(target);
  target.name = strings.dasherize(location.name);
  target.path = join(strings.dasherize(location.path) as Path, target.name);
  return target;
}

function generate(options: AngularOptions) {
  return (context: SchematicContext) =>
    apply(url('./files' as Path), [
      template({
        ...strings,
        ...options,
      }),
      move(options.path),
    ])(context);
}

function createAngularApplication(options: AngularOptions): Rule {
  if (!options.initApp) {
    return noop();
  }
  return externalSchematic('@schematics/angular', 'ng-new', {
    name: options.directory,
    version: '8.0.0',
  });
}

function addDeclarationToModule(options: AngularOptions): Rule {
  return (tree: Tree) => {
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path as any,
    });
    if (!options.module) {
      return tree;
    }
    const content = tree.read(options.module).toString();
    const declarator: ModuleDeclarator = new ModuleDeclarator();

    const rootPath = `${options.directory}/dist/${options.directory}`;
    const staticOptions = {
      name: 'forRoot',
      value: {
        rootPath,
      },
    };
    const declarationOptions = ({
      ...options,
      staticOptions,
    } as unknown) as DeclarationOptions;
    tree.overwrite(
      options.module,
      declarator.declare(content, declarationOptions),
    );
    return tree;
  };
}

function addGlobalPrefix(): Rule {
  return (tree: Tree) => {
    const mainFilePath = 'src/main.ts';
    const fileRef = tree.get(mainFilePath);
    if (!fileRef) {
      return tree;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ts = require('ts-morph');
    const tsProject = new ts.Project({
      manipulationSettings: {
        indentationText: ts.IndentationText.TwoSpaces,
      },
    });
    const tsFile = tsProject.addSourceFileAtPath(mainFilePath);
    const bootstrapFunction = tsFile.getFunction('bootstrap');
    const listenStatement = bootstrapFunction.getStatement(node =>
      node.getText().includes('listen'),
    );
    const setPrefixStatement = bootstrapFunction.getStatement(node =>
      node.getText().includes('setGlobalPrefix'),
    );
    if (!listenStatement || setPrefixStatement) {
      return tree;
    }
    const listenExprIndex = listenStatement.getChildIndex();
    bootstrapFunction.insertStatements(
      listenExprIndex,
      `app.setGlobalPrefix('api');`,
    );
    tree.overwrite(mainFilePath, tsFile.getFullText());
    return tree;
  };
}
