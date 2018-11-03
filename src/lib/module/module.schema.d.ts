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
   * Application language.
   */
  language?: string;
  /**
   * The source root path
   */
  sourceRoot?: string;
}
