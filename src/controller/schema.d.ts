import { Path } from '@angular-devkit/core';

export interface ControllerOptions {
  /**
   * The name of the controller.
   */
  name: string;
  /**
   * The path to create the controller.
   */
  path?: string | Path;
  /**
   * The path to insert the controller declaration.
   */
  module?: Path;
  /**
   * Directive to insert import in module.
   */
  skipImport?: boolean;
}
