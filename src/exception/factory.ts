import { Rule, Tree } from '@angular-devkit/schematics';

export function main(options: any): Rule {
  return (tree: Tree) => tree;
}
