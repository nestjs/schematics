import { Rule, Tree } from '@angular-devkit/schematics';
import { ExceptionOptions } from './schema';

export function main(options: ExceptionOptions): Rule {
  return (tree: Tree) => {
    tree.create(`${ options.rootDir }/${ options.path }/${ options.name }.exception.${ options.extension }`, '');
    return tree;
  };
}
