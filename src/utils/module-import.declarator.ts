import { normalize, Path } from '@angular-devkit/core';
import {
  createSourceFile,
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
  isTypeParameterDeclaration,
  isVariableDeclaration,
  Node,
  ScriptTarget,
  SourceFile,
  SyntaxKind,
} from 'typescript';
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
   * Declares a module import in the given content string.
   *
   * @param content - The content of the file where the import will be declared.
   * @param options - The options for the declaration, including the symbol and path.
   * @returns The updated content string with the import statement inserted.
   */
  public declare(content: string, options: DeclarationOptions): string {
    return this.declareWithSymbol(content, options).content;
  }

  /**
   * Declares the import and returns the local name used by module metadata.
   */
  public declareWithSymbol(
    content: string,
    options: DeclarationOptions,
  ): { content: string; symbol: string } {
    const symbol = String(options.symbol);
    const source = createSourceFile(
      options.module,
      content,
      ScriptTarget.Latest,
    );
    const imports = source.statements.filter(isImportDeclaration);
    const targetPath = this.computeRelativePath(options);
    const bindings = this.getModuleBindings(source);
    const requestedImports = this.findRequestedImports(
      imports,
      symbol,
      targetPath,
    ).filter(({ localName, binding }) =>
      bindings.get(localName)?.every((declaration) => declaration === binding),
    );
    if (requestedImports.length > 0) {
      return { content, symbol: requestedImports[0].localName };
    }

    const localSymbol = this.uniqueSymbol(symbol, new Set(bindings.keys()));
    const toInsert = this.buildLineToInsert(options, localSymbol);
    const lastImport = imports[imports.length - 1];
    const insertionPoint =
      lastImport?.end ?? source.statements[0]?.getStart(source) ?? source.end;
    const importText = lastImport ? `\n${toInsert}` : `${toInsert}\n`;
    return {
      content:
        content.slice(0, insertionPoint) +
        importText +
        content.slice(insertionPoint),
      symbol: localSymbol,
    };
  }

  private findRequestedImports(
    imports: ImportDeclaration[],
    symbol: string,
    targetPath: string,
  ): Array<{ localName: string; binding: Node }> {
    const bindings: Array<{ localName: string; binding: Node }> = [];
    for (const declaration of imports) {
      const clause = declaration.importClause;
      if (
        !clause ||
        clause.isTypeOnly ||
        !isStringLiteral(declaration.moduleSpecifier) ||
        declaration.moduleSpecifier.text !== targetPath ||
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
          bindings.push({
            localName: specifier.name.text,
            binding: specifier.name,
          });
        }
      }
    }
    return bindings;
  }

  private getModuleBindings(source: SourceFile): Map<string, Node[]> {
    const bindings = new Map<string, Node[]>();
    const addIdentifier = (identifier: Node): void => {
      if (!isIdentifier(identifier)) return;
      const declarations = bindings.get(identifier.text) ?? [];
      declarations.push(identifier);
      bindings.set(identifier.text, declarations);
    };
    const visit = (node: Node): void => {
      if (isImportDeclaration(node)) {
        const clause = node.importClause;
        if (clause?.name) addIdentifier(clause.name);
        if (clause?.namedBindings?.kind === SyntaxKind.NamespaceImport) {
          addIdentifier(clause.namedBindings.name);
        } else if (clause?.namedBindings) {
          for (const specifier of clause.namedBindings.elements) {
            addIdentifier(specifier.name);
          }
        }
        return;
      }
      if (isImportEqualsDeclaration(node)) {
        addIdentifier(node.name);
        return;
      }
      if (
        isClassDeclaration(node) ||
        isClassExpression(node) ||
        isFunctionDeclaration(node) ||
        isFunctionExpression(node) ||
        isInterfaceDeclaration(node) ||
        isTypeAliasDeclaration(node) ||
        isEnumDeclaration(node) ||
        isModuleDeclaration(node) ||
        isTypeParameterDeclaration(node)
      ) {
        if ('name' in node && node.name && isIdentifier(node.name)) {
          addIdentifier(node.name);
        }
      }
      if (isVariableDeclaration(node) || isParameter(node)) {
        this.addBindingNames(node.name, bindings);
      }
      node.forEachChild(visit);
    };
    visit(source);
    return bindings;
  }

  private addBindingNames(
    name: import('typescript').BindingName,
    bindings: Map<string, Node[]>,
  ): void {
    if (isIdentifier(name)) {
      const declarations = bindings.get(name.text) ?? [];
      declarations.push(name);
      bindings.set(name.text, declarations);
      return;
    }
    for (const element of name.elements) {
      if (element.kind !== SyntaxKind.OmittedExpression) {
        this.addBindingNames(element.name, bindings);
      }
    }
  }

  private uniqueSymbol(symbol: string, bindings: Set<string>): string {
    if (!bindings.has(symbol)) return symbol;
    let suffix = 1;
    while (bindings.has(`${symbol}_${suffix}`)) suffix++;
    return `${symbol}_${suffix}`;
  }

  /**
   * Builds the import line to insert based on the declaration options.
   *
   * @param options - The options for the declaration, including the symbol and path.
   * @returns The import line to insert.
   */
  private buildLineToInsert(
    options: DeclarationOptions,
    localSymbol: string,
  ): string {
    const alias = localSymbol === options.symbol ? '' : ` as ${localSymbol}`;
    return `import { ${options.symbol}${alias} } from '${this.computeRelativePath(options)}';`;
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
