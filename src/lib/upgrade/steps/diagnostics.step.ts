import { Rule, Tree } from '@angular-devkit/schematics';
import {
  collectSourceFiles,
  getSourceRoots,
  UpgradeReport,
} from '../upgrade.utils.js';

const LIFECYCLE_HOOKS =
  /\b(onModuleInit|onApplicationBootstrap|onModuleDestroy|beforeApplicationShutdown|onApplicationShutdown)\s*\(/;
const CUSTOM_PIPE = /implements\s+[^{]*\bPipeTransform\b/;
const LOGGER_CALL_WITH_OBJECT =
  /\.(log|warn|error|debug|verbose|fatal)\([^;]*?,\s*\{/;

const MAX_LISTED_FILES = 5;

function listFiles(files: string[]): string {
  const listed = files.slice(0, MAX_LISTED_FILES).join(', ');
  const rest = files.length - MAX_LISTED_FILES;
  return rest > 0 ? `${listed} and ${rest} more` : listed;
}

/**
 * Scans the sources for v12 behaviour changes that cannot be migrated
 * automatically and reports where they apply:
 *  - custom pipes (refined `PipeTransform`/`ArgumentMetadata` signatures),
 *  - structured logging params (`ConsoleLogger` now merges trailing objects),
 *  - lifecycle hook ordering (now by component hierarchy level).
 */
export function reviewSources(report: UpgradeReport): Rule {
  return (tree: Tree) => {
    const pipes: string[] = [];
    const loggers: string[] = [];
    const hooks: string[] = [];
    let usesJsonLogger = false;

    for (const path of collectSourceFiles(tree, getSourceRoots(tree))) {
      if (/\.(spec|test|e2e-spec)\.ts$/.test(path)) {
        continue;
      }
      const content = tree.read(path)!.toString('utf-8');
      if (content.includes('PipeTransform') && CUSTOM_PIPE.test(content)) {
        pipes.push(path);
      }
      if (LIFECYCLE_HOOKS.test(content)) {
        hooks.push(path);
      }
      if (
        content.includes('ConsoleLogger') &&
        /json\s*:\s*true/.test(content)
      ) {
        usesJsonLogger = true;
      }
      if (
        (content.includes('Logger') || content.includes('logger')) &&
        LOGGER_CALL_WITH_OBJECT.test(content)
      ) {
        loggers.push(path);
      }
    }

    if (pipes.length > 0) {
      report.warn(
        `Custom pipes found in ${listFiles(pipes)}: "PipeTransform#transform" signatures were refined and "ArgumentMetadata" now takes a generic parameter. Adjust hand-written signatures if the compiler complains.`,
      );
    }
    if (loggers.length > 0 || usesJsonLogger) {
      const where =
        loggers.length > 0
          ? `Logger calls that pass an object after the message were found in ${listFiles(loggers)}. `
          : '';
      report.warn(
        `${where}ConsoleLogger now treats plain objects passed after the message as structured params of the same entry (nested under "params" in JSON mode) instead of logging them separately. ` +
          'Pass "structuredParams: false" to ConsoleLogger to restore the previous behaviour. See https://docs.nestjs.com/techniques/logger#structured-logging-params',
      );
    }
    if (hooks.length >= 2) {
      report.warn(
        `Lifecycle hooks are implemented in ${hooks.length} files (${listFiles(hooks)}). Nest 12 invokes hooks by component hierarchy level, which may change the order in which related providers/modules are initialised or torn down — review any ordering assumptions and the tests that depend on them.`,
      );
    } else if (hooks.length === 1) {
      report.note(
        `Lifecycle hooks are now invoked by component hierarchy level (found in ${hooks[0]}); single-file usage is usually unaffected.`,
      );
    }
    return tree;
  };
}
