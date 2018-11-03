import { Path } from '@angular-devkit/core';

export interface PipeOptions {
  /**
   * The name of the pipe.
   */
  name: string;
  /**
   * The path to create the pipe.
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
}
