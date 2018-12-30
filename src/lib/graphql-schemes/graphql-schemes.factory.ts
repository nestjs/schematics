import { join, Path } from "@angular-devkit/core";
import { chain, mergeWith, Rule, Tree } from "@angular-devkit/schematics";
import { sync } from "fast-glob";
import { readFileSync } from "fs";
import { createSourceFile, ScriptTarget } from "typescript";
import { mergeSourceRoot } from "../../utils/source-root.helpers";
import { createScalarsFrom, transpileToGQL } from "./transpiler";

import { GraphQLSchemeOptions } from "./graphql-schemes.scheme";

export function main(options: GraphQLSchemeOptions): Rule {
  const allSchemes: string[] = sync([
    `${options.sourceRoot}/**/*.scheme.ts`,
    `!${options.sourceRoot}/**/node_modules/**`
  ]);
  const unresolvedTypes = new Set();
  const schemes = allSchemes.map(path => {
    const file = readFileSync(path, { encoding: "utf8" });
    const source = createSourceFile(path, file, ScriptTarget.ES2015);
    return transpileToGQL(source, unresolvedTypes);
  });
  return chain(
    [mergeSourceRoot(options)]
      .concat(
        schemes.map((scheme, index) => {
          const schemeContent = scheme.reduce((res, type) => {
            unresolvedTypes.delete(type.name);
            return `${res}${res ? "\n\n" : ""}${type.scheme}`;
          }, "");
          return generate(allSchemes[index] as Path, schemeContent);
        })
      )
      .concat([
        generate(
          join(options.sourceRoot as Path, "/scalars.grapqhl"),
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
    ctx.create(getPath(path), content);
    return ctx;
  };
}
