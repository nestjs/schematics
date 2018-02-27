import { Rule, Tree } from '@angular-devkit/schematics';
import { GuardOptions } from '../../test/guard/factory.test';

export function main(options: GuardOptions): Rule {
  return (tree: Tree) => tree;
}
