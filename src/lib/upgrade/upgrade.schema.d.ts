export interface UpgradeOptions {
  /**
   * Install and wire up `@nestjs/observe`.
   */
  observe?: boolean;
  /**
   * Do not run the package manager after updating `package.json`.
   */
  skipInstall?: boolean;
  /**
   * Use an npm dist-tag (e.g. `next`) instead of the default semver ranges
   * for NestJS packages.
   */
  tag?: string;
  /**
   * Format modified files using Prettier if available.
   */
  format?: boolean;
}
