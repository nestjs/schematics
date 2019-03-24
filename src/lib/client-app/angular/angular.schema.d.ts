import { Path } from '@angular-devkit/core';

export interface AngularOptions {
  /**
   * The name of the application.
   */
  name: string;
  /**
   * The directory of the application.
   */
  directory?: string;
  /**
   * The path to create the module.
   */
  path?: string;
  /**
   * The path to insert the module declaration.
   */
  module?: Path;
  /**
   * Flag which indicates if Angular app should be scaffolded
   */
  initApp?: boolean;
  /**
   * Metadata name affected by declaration insertion.
   */
  metadata?: string;
  /**
   * Nest element type name
   */
  type?: string;
}
