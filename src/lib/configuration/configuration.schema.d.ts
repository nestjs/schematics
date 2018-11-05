export interface ConfigurationOptions {
  /**
   * The project where generate the configuration.
   */
  project: string;
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
