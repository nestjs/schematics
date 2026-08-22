import { Rule, Tree } from '@angular-devkit/schematics';
import {
  isObjectLiteralExpression,
  isPropertyAssignment,
  SyntaxKind,
} from 'typescript';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
  NodeDependencyType,
} from '../../../utils/dependencies.utils.js';
import {
  applyEdits,
  collectSourceFiles,
  findProperty,
  forEachDescendant,
  getPropertyName,
  getSourceRoots,
  importsAnyOf,
  parseMajor,
  parseSource,
  quoteOf,
  removePackageJsonDependency,
  removePropertyEdit,
  TextEdit,
  UpgradeReport,
} from '../upgrade.utils.js';

const GRAPHQL_MODULES = [
  '@nestjs/graphql',
  '@nestjs/apollo',
  '@nestjs/mercurius',
];
const GRAPHQL_WS_VERSION = '^6.0.0';

/**
 * `@nestjs/graphql` v14:
 *  - GraphQL Playground is gone; `graphiql` is the IDE option (`playground`
 *    only survives as a deprecated boolean alias).
 *  - `subscriptions-transport-ws` support was removed; `graphql-ws` is the
 *    only subscriptions transport.
 */
export function migrateGraphql(report: UpgradeReport): Rule {
  return (tree: Tree) => {
    if (!getPackageJsonDependency(tree, '@nestjs/graphql')) {
      return tree;
    }
    let subscriptionsMigrated = false;

    for (const path of collectSourceFiles(tree, getSourceRoots(tree))) {
      const content = tree.read(path)!.toString('utf-8');
      if (!/@nestjs\/(graphql|apollo|mercurius)/.test(content)) {
        continue;
      }
      const source = parseSource(path, content);
      if (!importsAnyOf(source, GRAPHQL_MODULES)) {
        continue;
      }
      const edits: TextEdit[] = [];
      forEachDescendant(source, (node) => {
        if (!isObjectLiteralExpression(node)) {
          return;
        }
        for (const property of node.properties) {
          if (!isPropertyAssignment(property)) {
            continue;
          }
          const name = getPropertyName(property);
          if (name === 'playground') {
            const kind = property.initializer.kind;
            const isBoolean =
              kind === SyntaxKind.TrueKeyword ||
              kind === SyntaxKind.FalseKeyword;
            if (!isBoolean) {
              report.action(
                `${path}: "playground" is set to a non-boolean value. GraphQL Playground was removed in @nestjs/graphql v14 — replace it with "graphiql" (a boolean or a GraphiQL options object).`,
              );
              continue;
            }
            const value = property.initializer.getText(source);
            if (findProperty(node, 'graphiql')) {
              edits.push(removePropertyEdit(content, property));
              report.change(
                `${path}: removed the deprecated "playground: ${value}" option ("graphiql" is already configured)`,
              );
            } else {
              edits.push({
                start: property.name.getStart(source),
                end: property.name.getEnd(),
                text: 'graphiql',
              });
              report.change(
                `${path}: renamed "playground: ${value}" to "graphiql: ${value}" (GraphQL Playground was replaced by GraphiQL)`,
              );
            }
          } else if (name === 'subscriptions-transport-ws') {
            subscriptionsMigrated = true;
            if (findProperty(node, 'graphql-ws')) {
              edits.push(removePropertyEdit(content, property));
              report.change(
                `${path}: removed the "subscriptions-transport-ws" subscriptions transport ("graphql-ws" is already configured)`,
              );
            } else {
              const quote = quoteOf(property.name, source);
              edits.push({
                start: property.name.getStart(source),
                end: property.name.getEnd(),
                text: `${quote}graphql-ws${quote}`,
              });
              report.change(
                `${path}: switched the subscriptions transport from "subscriptions-transport-ws" to "graphql-ws"`,
              );
            }
          }
        }
      });
      if (edits.length > 0) {
        tree.overwrite(path, applyEdits(content, edits));
      }
    }

    if (subscriptionsMigrated) {
      const removedFrom = removePackageJsonDependency(
        tree,
        'subscriptions-transport-ws',
      );
      if (removedFrom) {
        report.change('Removed "subscriptions-transport-ws" from package.json');
      }
      if (!getPackageJsonDependency(tree, 'graphql-ws')) {
        addPackageJsonDependency(tree, {
          type: NodeDependencyType.Default,
          name: 'graphql-ws',
          version: GRAPHQL_WS_VERSION,
        });
        report.change(
          `Added "graphql-ws@${GRAPHQL_WS_VERSION}" to dependencies`,
        );
      }
      report.warn(
        'GraphQL subscriptions now use the "graphql-ws" protocol, which is wire-incompatible with "subscriptions-transport-ws": ' +
          'update your clients accordingly, and review any "onConnect" callback — with graphql-ws it receives the connection context ' +
          '(e.g. "{ connectionParams, extra }") and additional context values belong in "extra". See https://docs.nestjs.com/graphql/subscriptions',
      );
    }

    const apolloServer = getPackageJsonDependency(tree, '@apollo/server');
    const apolloMajor = parseMajor(apolloServer?.version);
    if (apolloServer && apolloMajor !== null && apolloMajor < 5) {
      report.action(
        `"@nestjs/apollo" v14 requires "@apollo/server" v5 (found "${apolloServer.version}"). Upgrade it along with its integration package (e.g. "@as-integrations/express5").`,
      );
    }
    if (getPackageJsonDependency(tree, 'apollo-server-express')) {
      report.action(
        '"apollo-server-express" (Apollo Server 3) is no longer supported. Migrate to "@apollo/server" v5: https://www.apollographql.com/docs/apollo-server/migration',
      );
    }
    return tree;
  };
}
