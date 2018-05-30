import { Path } from '@angular-devkit/core';

export interface ClassOptions {
  /**
   * The name of the class.
   */
  name: string;
  /**
   * The path to create the class.
   */
  path?: string | Path;
  /**
   * The Nest configuration language.
   */
  language?: string;
}
