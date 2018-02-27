import { Rule, Tree } from '@angular-devkit/schematics';
import { AssetOptions } from '../schemas';

export function main(options: AssetOptions): Rule {
  return (tree: Tree) => tree;
}
