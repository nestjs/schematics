import {
  ArrayLiteralExpression,
  CallExpression,
  createSourceFile,
  Decorator,
  Expression,
  Identifier,
  Node,
  NodeArray,
  ObjectLiteralElement,
  ObjectLiteralExpression,
  PropertyAssignment,
  ScriptTarget,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from 'typescript';
import { DeclarationOptions } from './module.declarator';

export class MetadataManager {
  constructor(private content: string) {}

  public insert(
    metadata: string,
    symbol: string,
    staticOptions?: DeclarationOptions['staticOptions'],
  ): string {
    const source: SourceFile = createSourceFile(
      'filename.ts',
      this.content,
      ScriptTarget.ES2017,
    );
    const decoratorNodes: Node[] = this.getDecoratorMetadata(source, '@Module');
    const node: Node = decoratorNodes[0];
    const matchingProperties: ObjectLiteralElement[] = (node as ObjectLiteralExpression).properties
      .filter(prop => prop.kind === SyntaxKind.PropertyAssignment)
      .filter((prop: PropertyAssignment) => {
        const name = prop.name;
        switch (name.kind) {
          case SyntaxKind.Identifier:
            return (name as Identifier).getText(source) === metadata;
          case SyntaxKind.StringLiteral:
            return (name as StringLiteral).text === metadata;
          default:
            return false;
        }
      });

    symbol = this.mergeSymbolAndExpr(symbol, staticOptions);
    const addBlankLinesIfDynamic = () => {
      symbol = staticOptions ? this.addBlankLines(symbol) : symbol;
    };
    if (matchingProperties.length === 0) {
      const expr = node as ObjectLiteralExpression;
      if (expr.properties.length === 0) {
        addBlankLinesIfDynamic();
        return this.insertMetadataToEmptyModuleDecorator(
          expr,
          metadata,
          symbol,
        );
      } else {
        addBlankLinesIfDynamic();
        return this.insertNewMetadataToDecorator(
          expr,
          source,
          metadata,
          symbol,
        );
      }
    } else {
      return this.insertSymbolToMetadata(
        source,
        matchingProperties,
        symbol,
        staticOptions,
      );
    }
  }

  private getDecoratorMetadata(source: SourceFile, identifier: string): Node[] {
    return this.getSourceNodes(source)
      .filter(
        node =>
          node.kind === SyntaxKind.Decorator &&
          (node as Decorator).expression.kind === SyntaxKind.CallExpression,
      )
      .map(node => (node as Decorator).expression as CallExpression)
      .filter(
        expr =>
          expr.arguments[0] &&
          expr.arguments[0].kind === SyntaxKind.ObjectLiteralExpression,
      )
      .map(expr => expr.arguments[0] as ObjectLiteralExpression);
  }

  private getSourceNodes(sourceFile: SourceFile): Node[] {
    const nodes: Node[] = [sourceFile];
    const result = [];
    while (nodes.length > 0) {
      const node = nodes.shift();
      if (node) {
        result.push(node);
        if (node.getChildCount(sourceFile) >= 0) {
          nodes.unshift(...node.getChildren());
        }
      }
    }
    return result;
  }

  private insertMetadataToEmptyModuleDecorator(
    expr: ObjectLiteralExpression,
    metadata: string,
    symbol: string,
  ): string {
    const position = expr.getEnd() - 1;
    const toInsert = `  ${metadata}: [${symbol}]`;
    return this.content.split('').reduce((content, char, index) => {
      if (index === position) {
        return `${content}\n${toInsert}\n${char}`;
      } else {
        return `${content}${char}`;
      }
    }, '');
  }

  private insertNewMetadataToDecorator(
    expr: ObjectLiteralExpression,
    source: SourceFile,
    metadata: string,
    symbol: string,
  ): string {
    const node = expr.properties[expr.properties.length - 1];
    const position = node.getEnd();
    const text = node.getFullText(source);
    const matches = text.match(/^\r?\n\s*/);
    let toInsert: string;
    if (matches) {
      toInsert = `,${matches[0]}${metadata}: [${symbol}]`;
    } else {
      toInsert = `, ${metadata}: [${symbol}]`;
    }
    return this.content.split('').reduce((content, char, index) => {
      if (index === position) {
        return `${content}${toInsert}${char}`;
      } else {
        return `${content}${char}`;
      }
    }, '');
  }

  private insertSymbolToMetadata(
    source: SourceFile,
    matchingProperties: ObjectLiteralElement[],
    symbol: string,
    staticOptions?: DeclarationOptions['staticOptions'],
  ): string {
    const assignment = matchingProperties[0] as PropertyAssignment;
    let node: Node | NodeArray<Expression>;
    const arrLiteral = assignment.initializer as ArrayLiteralExpression;
    if (arrLiteral.elements.length === 0) {
      node = arrLiteral;
    } else {
      node = arrLiteral.elements;
    }
    if (Array.isArray(node)) {
      const nodeArray = (node as {}) as Node[];
      const symbolsArray = nodeArray.map(childNode =>
        childNode.getText(source),
      );
      if (symbolsArray.includes(symbol)) {
        return this.content;
      }
      node = node[node.length - 1];
    }
    let toInsert: string;
    let position = (node as Node).getEnd();

    if ((node as Node).kind === SyntaxKind.ArrayLiteralExpression) {
      position--;
      toInsert = staticOptions ? this.addBlankLines(symbol) : `${symbol}`;
    } else {
      const text = (node as Node).getFullText(source);
      if (text.match(/^\r?\n/)) {
        toInsert = `,${text.match(/^\r?\n(\r?)\s+/)[0]}${symbol}`;
      } else {
        toInsert = `, ${symbol}`;
      }
    }
    return this.content.split('').reduce((content, char, index) => {
      if (index === position) {
        return `${content}${toInsert}${char}`;
      } else {
        return `${content}${char}`;
      }
    }, '');
  }

  private mergeSymbolAndExpr(
    symbol: string,
    staticOptions?: DeclarationOptions['staticOptions'],
  ): string {
    if (!staticOptions) {
      return symbol;
    }
    const spacing = 6;
    let options = JSON.stringify(staticOptions.value, null, spacing);
    options = options.replace(/\"([^(\")"]+)\":/g, '$1:');
    options = options.replace(/\"/g, `'`);
    options = options.slice(0, options.length - 1) + '    }';
    symbol += `.${staticOptions.name}(${options})`;
    return symbol;
  }

  private addBlankLines(expr: string): string {
    return `\n    ${expr}\n  `;
  }
}
