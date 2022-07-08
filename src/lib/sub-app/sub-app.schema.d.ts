import { Path } from '@angular-devkit/core';

export interface SubAppOptions {
  /**
   * Nest application name.
   */
  name: string;
  /**
   * Application language.
   */
  language?: string;
  /**
   * The path to create the application.
   */
  path?: string | Path;
  /**
   * Applications root directory
   */
  rootDir?: string | Path;
  /**
   * Specifies the file suffix of spec files.
   * @default "spec"
   */
  specFileSuffix?: string;
  sourceRoot?: string;
}
