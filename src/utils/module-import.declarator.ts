import { normalize, Path } from '@angular-devkit/core';
import {
  createSourceFile,
  getTrailingCommentRanges,
  isBlock,
  isCaseBlock,
  isCatchClause,
  isClassStaticBlockDeclaration,
  isDecorator,
  isCallExpression,
  isObjectLiteralExpression,
  isForStatement,
  isForInStatement,
  isForOfStatement,
  isFunctionLike,
  isModuleBlock,
  isVariableDeclarationList,
  NodeFlags,
  ImportDeclaration,
  isIdentifier,
  isImportDeclaration,
  isImportEqualsDeclaration,
  isStringLiteral,
  isClassDeclaration,
  isClassExpression,
  isEnumDeclaration,
  isFunctionDeclaration,
  isFunctionExpression,
  isInterfaceDeclaration,
  isModuleDeclaration,
  isParameter,
  isTypeAliasDeclaration,
  isVariableDeclaration,
  Node,
  SourceFile,
  SyntaxKind,
} from 'typescript';
import type { ScriptTarget } from 'typescript';
import { DeclarationOptions } from './module.declarator.js';
import { PathSolver } from './path.solver.js';

/**
 * The `ModuleImportDeclarator` class is responsible for declaring module imports
 * in a TypeScript file. It provides methods to insert import statements into the
 * file content based on the provided declaration options.
 */
export class ModuleImportDeclarator {
  constructor(private solver: PathSolver = new PathSolver()) {}

  /**
   * Inserts the requested named import without reusing or renaming its local symbol.
   * This legacy API can be composed directly with a metadata declarator.
   * Use `declareWithSymbol` when import reuse or collision handling is needed.
   *
   * @param content - The content of the file where the import will be declared.
   * @param options - The options for the declaration, including the symbol and path.
   * @returns The updated content string with the import statement inserted.
   */
  public declare(content: string, options: DeclarationOptions): string {
    const source = createSourceFile(
      options.module,
      content,
      99 as ScriptTarget,
    );
    const symbol = String(options.symbol);
    const targetPath = this.computeRelativePath(options);
    return this.insertImport(
      content,
      source,
      this.buildLineToInsert(symbol, symbol, targetPath),
    );
  }

  /**
   * Reuses a value import or inserts one with a collision-free local name.
   * Pass the returned symbol to the metadata declarator.
   */
  public declareWithSymbol(
    content: string,
    options: DeclarationOptions,
  ): { content: string; symbol: string } {
    const symbol = String(options.symbol);
    const source = createSourceFile(
      options.module,
      content,
      99 as ScriptTarget,
    );
    const imports = source.statements.filter(isImportDeclaration);
    const targetPath = this.computeRelativePath(options);
    const bindings = this.getModuleBindings(source);
    const requestedImports = this.findRequestedImports(
      imports,
      symbol,
      targetPath,
    ).filter((localName) => bindings.get(localName) === 1);
    if (requestedImports.length > 0) {
      return { content, symbol: requestedImports[0] };
    }

    const localSymbol = this.uniqueSymbol(symbol, bindings);
    return {
      content: this.insertImport(
        content,
        source,
        this.buildLineToInsert(symbol, localSymbol, targetPath),
      ),
      symbol: localSymbol,
    };
  }

  private insertImport(
    content: string,
    source: SourceFile,
    toInsert: string,
  ): string {
    // Recovery can turn everything after `from` into a moduleSpecifier expression.
    // Only complete string specifiers provide a safe import endpoint.
    const imports = source.statements
      .filter(isImportDeclaration)
      .filter(
        (node) =>
          isStringLiteral(node.moduleSpecifier) &&
          !node.moduleSpecifier.isUnterminated,
      );
    const lastImport = imports[imports.length - 1];
    let position =
      lastImport?.end ?? source.statements[0]?.getStart(source) ?? source.end;
    if (lastImport) {
      const comments = getTrailingCommentRanges(content, position) ?? [];
      position = comments[comments.length - 1]?.end ?? position;
    }
    const before = content.slice(0, position);
    const after = content.slice(position);
    const newline = content.includes('\r\n') ? '\r\n' : '\n';
    const prefix =
      before && !before.endsWith('\n') && !before.endsWith('\r') ? newline : '';
    const suffix =
      after.startsWith('\n') || after.startsWith('\r') ? '' : newline;
    return before + prefix + toInsert + suffix + after;
  }

  private findRequestedImports(
    imports: ImportDeclaration[],
    symbol: string,
    targetPath: string,
  ): string[] {
    const bindings: string[] = [];
    for (const declaration of imports) {
      const clause = declaration.importClause;
      if (
        !clause ||
        clause.isTypeOnly ||
        !isStringLiteral(declaration.moduleSpecifier) ||
        declaration.moduleSpecifier.isUnterminated ||
        this.normalizeSpecifier(declaration.moduleSpecifier.text) !==
          this.normalizeSpecifier(targetPath) ||
        clause.namedBindings?.kind !== SyntaxKind.NamedImports
      ) {
        continue;
      }
      for (const specifier of clause.namedBindings.elements) {
        const importedName = specifier.propertyName ?? specifier.name;
        if (
          !specifier.isTypeOnly &&
          isIdentifier(importedName) &&
          importedName.text === symbol
        ) {
          bindings.push(specifier.name.text);
        }
      }
    }
    return bindings;
  }

  private normalizeSpecifier(path: string): string {
    return path.endsWith('.js') ? path.slice(0, -3) : path;
  }

  /** Scopes enclosing the first decorator handled by MetadataManager. */
  private getModuleScopes(source: SourceFile): Set<Node> {
    type Entry = { node: Node; parent?: Entry };
    const pending: Entry[] = [{ node: source }];
    while (pending.length) {
      const entry = pending.pop()!;
      const { node } = entry;
      if (
        isDecorator(node) &&
        isCallExpression(node.expression) &&
        isIdentifier(node.expression.expression) &&
        node.expression.expression.text.toLowerCase() === 'module' &&
        node.expression.arguments[0] &&
        isObjectLiteralExpression(node.expression.arguments[0])
      ) {
        const scopes = new Set<Node>();
        for (
          let ancestor: Entry | undefined = entry;
          ancestor;
          ancestor = ancestor.parent
        ) {
          scopes.add(ancestor.node);
        }
        return scopes;
      }
      const children: Node[] = [];
      node.forEachChild((child) => {
        children.push(child);
      });
      for (let i = children.length - 1; i >= 0; i--) {
        pending.push({ node: children[i], parent: entry });
      }
    }
    return new Set([source]);
  }

  /** Count only declarations visible at the decorator, including hoisted var bindings. */
  private getModuleBindings(source: SourceFile): Map<string, number> {
    const scopes = this.getModuleScopes(source);
    const bindings = new Map<string, number>();
    const addName = (name: Node, scope: Node): void => {
      if (!scopes.has(scope)) return;
      const names = [name];
      while (names.length) {
        const current = names.pop()!;
        if (isIdentifier(current)) {
          bindings.set(current.text, (bindings.get(current.text) ?? 0) + 1);
        } else if (
          current.kind === SyntaxKind.ObjectBindingPattern ||
          current.kind === SyntaxKind.ArrayBindingPattern
        ) {
          current.forEachChild((element) => {
            if (element.kind === SyntaxKind.BindingElement)
              names.push((element as import('typescript').BindingElement).name);
          });
        }
      }
    };
    const pending: Array<{
      node: Node;
      lexical: Node;
      hoist: Node;
      parent?: Node;
    }> = [{ node: source, lexical: source, hoist: source }];
    while (pending.length) {
      const { node, lexical, hoist, parent } = pending.pop()!;
      if (isImportDeclaration(node)) {
        const clause = node.importClause;
        if (clause?.name) addName(clause.name, lexical);
        if (clause?.namedBindings?.kind === SyntaxKind.NamespaceImport) {
          addName(clause.namedBindings.name, lexical);
        } else if (clause?.namedBindings) {
          for (const specifier of clause.namedBindings.elements)
            addName(specifier.name, lexical);
        }
        continue;
      }
      if (isImportEqualsDeclaration(node)) addName(node.name, lexical);
      if (
        isClassDeclaration(node) ||
        isFunctionDeclaration(node) ||
        isEnumDeclaration(node) ||
        isModuleDeclaration(node)
      ) {
        if (node.name) addName(node.name, lexical);
      }
      // Type declarations can conflict with an import at module scope, but
      // nested type names (including type parameters) do not shadow its value.
      if (
        (isInterfaceDeclaration(node) || isTypeAliasDeclaration(node)) &&
        lexical === source
      ) {
        addName(node.name, source);
      }
      if (isClassExpression(node) || isFunctionExpression(node)) {
        if (node.name) addName(node.name, node);
      }
      if (isVariableDeclaration(node)) {
        const scope =
          parent &&
          isVariableDeclarationList(parent) &&
          !(parent.flags & NodeFlags.BlockScoped)
            ? hoist
            : lexical;
        addName(node.name, scope);
      }
      if (isParameter(node)) addName(node.name, lexical);

      let childLexical = lexical;
      let childHoist = hoist;
      if (
        isFunctionLike(node) ||
        isModuleBlock(node) ||
        isModuleDeclaration(node) ||
        isClassStaticBlockDeclaration(node)
      ) {
        childLexical = childHoist = node;
      } else if (
        isBlock(node) ||
        isCaseBlock(node) ||
        isCatchClause(node) ||
        isForStatement(node) ||
        isForInStatement(node) ||
        isForOfStatement(node) ||
        isClassDeclaration(node) ||
        isClassExpression(node)
      ) {
        childLexical = node;
      }
      node.forEachChild((child) => {
        pending.push({
          node: child,
          lexical: childLexical,
          hoist: childHoist,
          parent: node,
        });
      });
    }
    return bindings;
  }

  private uniqueSymbol(
    symbol: string,
    bindings: ReadonlyMap<string, number>,
  ): string {
    if (!bindings.has(symbol)) return symbol;
    let suffix = 1;
    while (bindings.has(`${symbol}_${suffix}`)) suffix++;
    return `${symbol}_${suffix}`;
  }

  /**
   * Builds the import line to insert based on the declaration options.
   *
   * @param symbol - The exported symbol to import.
   * @param localSymbol - The local identifier to use.
   * @param targetPath - The precomputed module specifier.
   * @returns The import line to insert.
   */
  private buildLineToInsert(
    symbol: string,
    localSymbol: string,
    targetPath: string,
  ): string {
    const alias = localSymbol === symbol ? '' : ` as ${localSymbol}`;
    return `import { ${symbol}${alias} } from '${targetPath}';`;
  }

  /**
   * Computes the relative path for the import statement.
   *
   * @param options - The options for the declaration, including the symbol and path.
   * @returns The relative path for the import statement.
   */
  private computeRelativePath(options: DeclarationOptions): string {
    let importModulePath: Path;
    if (options.type !== undefined) {
      importModulePath = normalize(
        `/${options.path}/${options.name}.${options.type}`,
      );
    } else {
      importModulePath = normalize(`/${options.path}/${options.name}`);
    }
    const relativePath = this.solver.relative(options.module, importModulePath);
    return options.isEsm ? `${relativePath}.js` : relativePath;
  }
}
