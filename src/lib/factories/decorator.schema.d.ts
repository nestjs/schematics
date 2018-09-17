import { Path } from '@angular-devkit/core';

export interface DecoratorOptions {
  /**
   * The name of the decorator.
   */
  name: string;
  /**
   * The path to create the decorator.
   */
  path?: string | Path;
  /**
   * The Nest configuration language.
   */
  language?: string;
  /**
   * The source root path
   */
  sourceRoot?: string;
}
