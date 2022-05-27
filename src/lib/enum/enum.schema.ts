import { Path } from '@angular-devkit/core';

export interface EnumOptions {
  /**
   * The name of the enum.
   */
  name: string;
  /**
   * The path to create the enum.
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
