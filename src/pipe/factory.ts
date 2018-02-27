import { Rule, Tree } from '@angular-devkit/schematics';
import { PipeOptions } from './schema';

export function main(options: PipeOptions): Rule {
  return (tree: Tree) => tree;
}
