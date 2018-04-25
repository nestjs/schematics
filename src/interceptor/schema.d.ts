import { Path } from '@angular-devkit/core';

export interface InterceptorOptions {
  /**
   * The name of the interceptor.
   */
  name: string;
  /**
   * The path to create the interceptor.
   */
  path?: string | Path;
  /**
   * The Nest configuration language.
   */
  language?: string;
}
