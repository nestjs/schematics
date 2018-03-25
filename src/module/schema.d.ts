import { Path } from '@angular-devkit/core';

export interface ModuleOptions {
  /**
   * The name of the module.
   */
  name: string;
  /**
   * The path to create the module.
   */
  path?: string;
  /**
   * The path to insert the module declaration.
   */
  module?: Path;
  /**
   * Directive to insert import in module.
   */
  skipImport?: boolean;
}
