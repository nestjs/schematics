import * as ts from 'typescript';

export class TypescriptUtils {
  public static getTsSource(path: string, content: string): ts.SourceFile {
    return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true) as ts.SourceFile;
  }

  public static findNodes(node: ts.Node, kind: ts.SyntaxKind, max = Infinity): ts.Node[] {
    if (!node || max === 0) {
      return [];
    }
    const arr: ts.Node[] = [];
    if (node.kind === kind) {
      arr.push(node);
      max--;
    }
    if (max > 0) {
      for (const child of node.getChildren()) {
        this.findNodes(child, kind, max).forEach((node) => {
          if (max > 0) {
            arr.push(node);
          }
          max--;
        });
        if (max <= 0) {
          break;
        }
      }
    }
    return arr;
  }
}
