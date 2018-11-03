import { Path } from '@angular-devkit/core';

export interface MiddlewareOptions {
  /**
   * The name of the middleware.
   */
  name: string;
  /**
   * The path to create the middleware
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
