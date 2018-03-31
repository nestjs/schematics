import { Path } from '@angular-devkit/core';

export interface PipeOptions {
  /**
   * The name of the pipe.
   */
  name: string;
  /**
   * The path to create the middleware.
   */
  path?: string | Path;
}
