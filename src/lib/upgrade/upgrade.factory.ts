import {
  chain,
  noop,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { formatFiles } from '../../utils/format-files.rule.js';
import { migrateCliConfig } from './steps/cli-config.step.js';
import { migrateConfigModule } from './steps/config.step.js';
import { reviewSources } from './steps/diagnostics.step.js';
import {
  installDependencies,
  updateNestDependencies,
} from './steps/dependencies.step.js';
import { migrateGraphql } from './steps/graphql.step.js';
import { migrateNats } from './steps/nats.step.js';
import { setupObserve } from './steps/observe.step.js';
import { migrateTestRunner } from './steps/testing.step.js';
import { checkTsConfig } from './steps/tsconfig.step.js';
import {
  assertUpgradeable,
  checkNodeVersion,
} from './steps/preconditions.step.js';
import type { UpgradeOptions } from './upgrade.schema.js';
import { UpgradeReport } from './upgrade.utils.js';

/**
 * Upgrades an existing NestJS v11 project to v12.
 *
 * The schematic deliberately does not migrate to ESM, Vitest or oxlint — those
 * are the defaults for newly generated projects, but existing projects can
 * adopt them on their own schedule.
 */
export function main(options: UpgradeOptions): Rule {
  const report = new UpgradeReport();
  return chain([
    (tree: Tree) => {
      checkNodeVersion(report);
      assertUpgradeable(tree, report);
      return tree;
    },
    updateNestDependencies(options, report),
    migrateTestRunner(report),
    migrateCliConfig(report),
    migrateGraphql(report),
    migrateNats(report),
    migrateConfigModule(report),
    options.observe ? setupObserve(report) : noop(),
    checkTsConfig(report),
    reviewSources(report),
    options.format ? formatFiles() : noop(),
    installDependencies(options, report),
    (tree: Tree, context: SchematicContext) => {
      report.print(context);
      return tree;
    },
  ]);
}
