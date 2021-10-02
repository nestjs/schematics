export interface ApplicationOptions {
  /**
   * Nest application name.
   */
  name: string;
  /**
   * Nest application author.
   */
  author?: string;
  /**
   * Nest application description.
   */
  description?: string;
  /**
   * Nest application destination directory.
   */
  directory?: string;
  /**
   * With TypeScript strict mode.
   */
  strict?: boolean;
  /**
   * Nest application version.
   */
  version?: string;
  /**
   * Application language.
   */
  language?: 'js' | 'ts';
  /**
   * The used package manager.
   */
  packageManager?: 'npm' | 'yarn' | 'undefined';
  /**
   * The underlying HTTP platform to use.
   */
  platform?: 'express' | 'fastify';
  /**
   * Nest included production dependencies (comma separated values).
   */
  dependencies?: string;
  /**
   * Nest included development dependencies (comma separated values).
   */
  devDependencies?: string;
}
