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
  spec?: boolean;
  /**
   * Flag to indicate if a directory is created.
   */
  flat?: boolean;
}
