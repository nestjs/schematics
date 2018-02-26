import { AssetOptions } from '../schemas';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function main(options: AssetOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return tree;
  }
}