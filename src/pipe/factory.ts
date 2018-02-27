import { Rule, Tree } from '@angular-devkit/schematics';
import { PipeOptions } from './schema';

export function main(options: PipeOptions): Rule {
  return (tree: Tree) => {
    tree.create(`${ options.rootDir }/${ options.path }/${ options.name }.pipe.${ options.extension }`, '');
    return tree;
  };
}
