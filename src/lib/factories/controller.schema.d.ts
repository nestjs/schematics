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
   * Directive to insert declaration in module.
   */
  skipImport?: boolean;
  /**
   * Metadata name affected by declaration insertion.
   */
  metadata?: string;
  /**
   * Nest element type name
   */
  type?: string;
  /**
   * The Nest configuration language.
   */
  language?: string;
  /**
   * The source root path
   */
  sourceRoot?: string;
}
