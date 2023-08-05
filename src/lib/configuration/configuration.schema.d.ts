export interface ConfigurationOptions {
  /**
   * The project where generate the configuration.
   * If not supplied or nil, the file will be created in the current working directory instead.
   */
  project?: string;
  /**
   * The language to use in configuration (ts | js).
   */
  language?: string;
  /**
   * The collection to use in the configuration
   */
  collection?: string;
  /**
   * The source root directory
   */
  sourceRoot?: string;
}
