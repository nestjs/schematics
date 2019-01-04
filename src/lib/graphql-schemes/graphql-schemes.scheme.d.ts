export interface GraphQLSchemeOptions {
  /**
   * The source project root path
   */
  sourceRoot?: string;
  /**
   * The find files method (needed for testing)
   */
  findFiles?: (patterns: string[]) => string[];
  /**
   * The read file method (needed for testing)
   */
  readFile?: (path: string, options: { encoding: string }) => string;
  /**
   * The logger for error (needed for testing)
   */
  logger?: { error(message: string): void, complete(): void };
}
