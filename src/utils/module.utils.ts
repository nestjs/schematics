import { normalize } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';

export class ModuleUtils {
  public static find(tree: Tree, moduleName: string): string {
    return normalize(`/src/${ moduleName }.module.ts`);
  }
}
