import { Path } from '@angular-devkit/core';

export interface GuardOptions {
  /**
   * The name of the guard.
   */
  name: string;
  /**
   * The path to create the guard.
   */
  path?: string | Path;
  /**
   * The Nest configuration language.
   */
  language?: string;
}
