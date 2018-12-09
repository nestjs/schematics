import { Path } from '@angular-devkit/core';

export interface InterfaceOptions {
  /**
   * The name of the interface.
   */
  name: string;
  /**
   * The path to create the interface.
   */
  path?: string | Path;
  /**
   * The source root path
   */
  sourceRoot?: string;
  /**
   * Flag to indicate if a directory is created.
   */
  flat?: boolean;
}
