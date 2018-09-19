"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
class MetadataManager {
    constructor(content) {
        this.content = content;
    }
    insert(metadata, symbol) {
        const source = typescript_1.createSourceFile('filename.ts', this.content, typescript_1.ScriptTarget.ES2017);
        const decoratorNodes = this.getDecoratorMetadata(source, '@Module');
        const node = decoratorNodes[0];
        const matchingProperties = node.properties
            .filter((prop) => prop.kind === typescript_1.SyntaxKind.PropertyAssignment)
            .filter((prop) => {
            const name = prop.name;
            switch (name.kind) {
                case typescript_1.SyntaxKind.Identifier:
                    return name.getText(source) === metadata;
                case typescript_1.SyntaxKind.StringLiteral:
                    return name.text === metadata;
                default:
                    return false;
            }
        });
        if (matchingProperties.length === 0) {
            const expr = node;
            if (expr.properties.length === 0) {
                return this.insertMetadataToEmptyModuleDecorator(expr, metadata, symbol);
            }
            else {
                return this.insertNewMetadataToDecorator(expr, source, metadata, symbol);
            }
        }
        else {
            return this.insertSymbolToMetadata(source, matchingProperties, symbol);
        }
    }
    getDecoratorMetadata(source, identifier) {
        return this.getSourceNodes(source)
            .filter((node) => node.kind === typescript_1.SyntaxKind.Decorator && node.expression.kind === typescript_1.SyntaxKind.CallExpression)
            .map((node) => node.expression)
            .filter((expr) => expr.arguments[0] && expr.arguments[0].kind === typescript_1.SyntaxKind.ObjectLiteralExpression)
            .map((expr) => expr.arguments[0]);
    }
    getSourceNodes(sourceFile) {
        const nodes = [sourceFile];
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
    insertMetadataToEmptyModuleDecorator(expr, metadata, symbol) {
        const position = expr.getEnd() - 1;
        const toInsert = `  ${metadata}: [${symbol}]`;
        return this.content.split('').reduce((content, char, index) => {
            if (index === position) {
                return `${content}\n${toInsert}\n${char}`;
            }
            else {
                return `${content}${char}`;
            }
        }, '');
    }
    insertNewMetadataToDecorator(expr, source, metadata, symbol) {
        const node = expr.properties[expr.properties.length - 1];
        const position = node.getEnd();
        const text = node.getFullText(source);
        const matches = text.match(/^\r?\n\s*/);
        let toInsert;
        if (matches.length > 0) {
            toInsert = `,${matches[0]}${metadata}: [${symbol}]`;
        }
        else {
            toInsert = `, ${metadata}: [${symbol}]`;
        }
        return this.content.split('').reduce((content, char, index) => {
            if (index === position) {
                return `${content}${toInsert}${char}`;
            }
            else {
                return `${content}${char}`;
            }
        }, '');
    }
    insertSymbolToMetadata(source, matchingProperties, symbol) {
        const assignment = matchingProperties[0];
        let node;
        const arrLiteral = assignment.initializer;
        if (arrLiteral.elements.length === 0) {
            node = arrLiteral;
        }
        else {
            node = arrLiteral.elements;
        }
        if (Array.isArray(node)) {
            const nodeArray = node;
            const symbolsArray = nodeArray.map((childNode) => childNode.getText(source));
            if (symbolsArray.includes(symbol)) {
                return this.content;
            }
            node = node[node.length - 1];
        }
        let toInsert;
        let position = node.getEnd();
        if (node.kind === typescript_1.SyntaxKind.ArrayLiteralExpression) {
            position--;
            toInsert = `${symbol}`;
        }
        else {
            const text = node.getFullText(source);
            if (text.match(/^\r?\n/)) {
                toInsert = `,${text.match(/^\r?\n(\r?)\s+/)[0]}${symbol}`;
            }
            else {
                toInsert = `, ${symbol}`;
            }
        }
        return this.content.split('').reduce((content, char, index) => {
            if (index === position) {
                return `${content}${toInsert}${char}`;
            }
            else {
                return `${content}${char}`;
            }
        }, '');
    }
}
exports.MetadataManager = MetadataManager;
