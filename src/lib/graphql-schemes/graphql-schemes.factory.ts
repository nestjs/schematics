import { join, logging, Path } from "@angular-devkit/core";
import { chain, mergeWith, noop, Rule, Tree } from "@angular-devkit/schematics";
import { sync } from "fast-glob";
import { readFileSync } from "fs";
import { createSourceFile, ScriptTarget } from "typescript";
import { mergeSourceRoot } from "../../utils/source-root.helpers";
import {
  CompilerError,
  createScalarsFrom,
  GraphQLSchemeItem,
  transpileToGQL
} from "./transpiler";

import { GraphQLSchemeOptions } from "./graphql-schemes.scheme";

class GeneratingError extends CompilerError {
  constructor(public filePath: string, err: CompilerError) {
    super(err.message, err.line, err.column);
  }
}

function formatError(error: GeneratingError) {
  return `${error.filePath}(${error.line},${error.column}): ${error.message}`;
}

function getContent(
  scheme: GraphQLSchemeItem[],
  unresolvedTypes: Set<string>
): string {
  return scheme.reduce((content, type) => {
    unresolvedTypes.delete(type.name);
    return `${content}${content ? "\n\n" : ""}${type.scheme}`;
  }, "");
}

function showErrors(errors: GeneratingError[], logger) {
  errors.forEach(error => logger.error(formatError(error)));
  logger.complete();
}

export function main({
  findFiles = sync,
  readFile = readFileSync,
  logger = new logging.Logger("GraphQL"),
  ...options
}: GraphQLSchemeOptions): Rule {
  const allSchemes: string[] = findFiles([
    `${options.sourceRoot}/**/*.scheme.ts`,
    `!${options.sourceRoot}/**/node_modules/**`
  ]);
  const unresolvedTypes = new Set();
  let filesErrors = [];
  const schemes = allSchemes.reduce((schms, path) => {
    const file = readFile(path, { encoding: "utf8" });
    const source = createSourceFile(path, file, ScriptTarget.ES2015);
    const { types, errors } = transpileToGQL(source, unresolvedTypes);
    if (errors.length) {
      filesErrors = filesErrors.concat(
        errors.map(e => new GeneratingError(path, e))
      );
      return schms;
    }
    return schms.concat([types]);
  }, []);
  if (filesErrors.length) {
    showErrors(filesErrors, logger);
    return noop();
  }
  return chain(
    [mergeSourceRoot(options)]
      .concat(
        schemes.reduce((res, scheme, index) => {
          const schemeContent: string = getContent(scheme, unresolvedTypes);
          if (!schemeContent) {
            return res;
          }
          return res.concat([
            generate(allSchemes[index] as Path, schemeContent)
          ]);
        }, [])
      )
      .concat([
        generate(
          join(options.sourceRoot as Path, "/scalars.graphql"),
          createScalarsFrom(unresolvedTypes)
        )
      ])
  );
}

function getPath(path: Path): Path {
  return path.replace(/.ts$/gi, ".graphql") as Path;
}

function generate(path: Path, content: string): Rule {
  return (ctx: Tree) => {
    if (!content) {
      return ctx;
    }
    ctx.create(getPath(path), content);
    return ctx;
  };
}
