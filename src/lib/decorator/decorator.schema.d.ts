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
   * Application language.
   */
  language?: string;
  /**
   * The source root path
   */
  sourceRoot?: string;
  /**
   * Specifies if a spec file is generated.
   */
  spec?: 'true' | 'false';
  /**
   * Flag to indicate if a directory is created.
   */
  flat?: boolean;
}
