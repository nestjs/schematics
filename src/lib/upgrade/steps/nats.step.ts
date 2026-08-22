import { Rule, Tree } from '@angular-devkit/schematics';
import { isImportDeclaration, isStringLiteral } from 'typescript';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
  NodeDependencyType,
} from '../../../utils/dependencies.utils.js';
import {
  applyEdits,
  collectSourceFiles,
  getSourceRoots,
  parseSource,
  quoteOf,
  removePackageJsonDependency,
  TextEdit,
  UpgradeReport,
} from '../upgrade.utils.js';

const NATS_TRANSPORT_PACKAGE = '@nats-io/transport-node';
const NATS_CORE_PACKAGE = '@nats-io/nats-core';
const NATS_V3 = '^3.0.0';

/**
 * `@nestjs/microservices` v12 targets NATS v3: the legacy `nats` package is
 * replaced by `@nats-io/transport-node` (driver) and `@nats-io/nats-core`
 * (helpers such as `headers()`).
 */
export function migrateNats(report: UpgradeReport): Rule {
  return (tree: Tree) => {
    if (!getPackageJsonDependency(tree, '@nestjs/microservices')) {
      return tree;
    }
    const legacyDependency = getPackageJsonDependency(tree, 'nats');
    let usesNats = !!legacyDependency;
    let importsRewritten = false;
    let customDeserializer = false;

    for (const path of collectSourceFiles(tree, getSourceRoots(tree))) {
      const content = tree.read(path)!.toString('utf-8');
      if (!/\bnats\b/i.test(content)) {
        continue;
      }
      const usesTransport = /Transport\.NATS\b/.test(content);
      const source = parseSource(path, content);
      const edits: TextEdit[] = [];
      for (const statement of source.statements) {
        if (
          isImportDeclaration(statement) &&
          isStringLiteral(statement.moduleSpecifier) &&
          statement.moduleSpecifier.text === 'nats'
        ) {
          const quote = quoteOf(statement.moduleSpecifier, source);
          edits.push({
            start: statement.moduleSpecifier.getStart(source),
            end: statement.moduleSpecifier.getEnd(),
            text: `${quote}${NATS_CORE_PACKAGE}${quote}`,
          });
        }
      }
      if (edits.length > 0) {
        importsRewritten = true;
        tree.overwrite(path, applyEdits(content, edits));
        report.change(
          `${path}: rewrote "nats" imports to "${NATS_CORE_PACKAGE}"`,
        );
      }
      if (usesTransport || edits.length > 0) {
        usesNats = true;
      }
      if (usesTransport && /\b(de)?serializer\s*:/.test(content)) {
        customDeserializer = true;
      }
    }

    if (!usesNats) {
      return tree;
    }

    const dependencyType = legacyDependency?.type ?? NodeDependencyType.Default;
    if (legacyDependency) {
      removePackageJsonDependency(tree, 'nats');
      report.change('Removed the legacy "nats" package from package.json');
    }
    if (!getPackageJsonDependency(tree, NATS_TRANSPORT_PACKAGE)) {
      addPackageJsonDependency(tree, {
        type: dependencyType,
        name: NATS_TRANSPORT_PACKAGE,
        version: NATS_V3,
      });
      report.change(
        `Added "${NATS_TRANSPORT_PACKAGE}@${NATS_V3}" (NATS v3 driver used by @nestjs/microservices v12)`,
      );
    }
    if (
      importsRewritten &&
      !getPackageJsonDependency(tree, NATS_CORE_PACKAGE)
    ) {
      addPackageJsonDependency(tree, {
        type: dependencyType,
        name: NATS_CORE_PACKAGE,
        version: NATS_V3,
      });
      report.change(`Added "${NATS_CORE_PACKAGE}@${NATS_V3}"`);
    }
    if (importsRewritten) {
      report.warn(
        `Review the symbols you import from "${NATS_CORE_PACKAGE}": NATS v3 dropped the "StringCodec"/"JSONCodec" helpers and reorganised connection types. "headers()" is still available there.`,
      );
    }
    if (customDeserializer) {
      report.warn(
        'NATS transport: Nest 12 serializes NATS packets as JSON strings and custom deserializers now receive the full NATS message instead of a raw "Uint8Array" — read the payload with "msg.json()" instead of decoding bytes manually.',
      );
    } else {
      report.note(
        'NATS transport: Nest 12 serializes packets as JSON strings; if you add custom (de)serializers, they receive the full NATS message ("msg.json()").',
      );
    }
    return tree;
  };
}
