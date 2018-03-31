import { Path } from '@angular-devkit/core';

export interface ExceptionOptions {
  /**
   * The name of the exception.
   */
  name: string;
  /**
   * The path to create the exception.
   */
  path?: string | Path;
}
