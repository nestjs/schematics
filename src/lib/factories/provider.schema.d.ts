import { Path } from '@angular-devkit/core';

export interface ProviderOptions {
  /**
   * The name of the provider.
   */
  name: string;
  /**
   * The path to create the provider.
   */
  path?: string;
  /**
   * The path to insert the provider declaration.
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
}
