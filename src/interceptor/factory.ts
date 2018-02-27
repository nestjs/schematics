import { Rule, Tree } from '@angular-devkit/schematics';
import { InterceptorOptions } from '../../test/interceptor/factory.test';

export function main(options: InterceptorOptions): Rule {
  return (tree: Tree) => {
    tree.create(`${ options.rootDir }/${ options.path }/${ options.name }.interceptor.${ options.extension }`, '');
    return tree;
  };
}
