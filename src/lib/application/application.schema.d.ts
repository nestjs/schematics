export interface ApplicationOptions {
  /**
   * Nest application name.
   */
  // NOTE: We could have a `number` here due to this issue: https://github.com/nestjs/nest-cli/issues/1519
  name: string | number;
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
  language?: string;
  /**
   * Module type (CJS or ESM).
   * @default "esm"
   */
  type?: 'cjs' | 'esm';
  /**
   * The used package manager.
   */
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'undefined';
  /**
   * Nest included production dependencies (comma separated values).
   */
  dependencies?: string;
  /**
   * Nest included development dependencies (comma separated values).
   */
  devDependencies?: string;
  /**
   * Specifies if a spec file is generated.
   */
  spec?: boolean;
  /**
   * Specifies the file suffix of spec files.
   * @default "spec"
   */
  specFileSuffix?: string;
  /**
   * Format generated files using Prettier if available.
   */
  format?: boolean;
  /**
   * Preconfigure the application with `@nestjs/observe`.
   * @default false
   */
  observe?: boolean;
  /**
   * Generate an application whose code is one file, `src/main.ts`.
   * @default false
   */
  minimal?: boolean;
  /**
   * The targets `nest new` installed the official NestJS agent skills for
   * (`npx @nestjs/skills add --agent`), so AGENTS.md can give the command
   * that updates them: `agents`, `claude`, `cursor` or `all`. Empty: AGENTS.md
   * doesn't mention skills.
   * @default []
   */
  skills?: ('all' | 'agents' | 'claude' | 'cursor')[];
}
