export interface ProjectOptions {
  /**
   * The Nest project name.
   */
  name: string;
  /**
   * The Nest project author.
   */
  author?: string;
  /**
   * The Nest project description.
   */
  description?: string;
  /**
   * The Nest project version.
   */
  version?: string;
  /**
   * project language.
   */
  language?: string;
  /**
   * The package manager to use.
   */
  packageManager?: 'npm' | 'yarn';
}
