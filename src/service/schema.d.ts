import { Path } from '@angular-devkit/core';

export interface ServiceOptions {
  /**
   * The name of the service.
   */
  name: string;
  /**
   * The path to create the service.
   */
  path?: string;
  /**
   * The path to insert the service declaration.
   */
  module?: Path;
  /**
   * Directive to insert import in module.
   */
  skipImport?: boolean;
}
