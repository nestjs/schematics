export interface ApplicationOptions {
  /**
   * The Nest application author.
   */
  author?: string;
  /**
   * The Nest application description.
   */
  description?: string;
  /**
   * The Nest application name.
   */
  name: string;
  /**
   * The Nest application version.
   */
  version?: string;
  /**
   * Application language.
   */
  language?: string;
  /**
   * The used package manager.
   */
  packageManager?: 'npm' | 'yarn';
  /**
   * The Nest included production dependencies (comma separated values).
   */
  dependencies?: string;
  /**
   * The Nest included development dependencies (comma separated values).
   */
  devDependencies?: string;
}
