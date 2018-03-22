export class ModuleImportUtils {
  public static insert(source: string, symbol: string, relativePath: string): string {
    const importLines: string[] = this.findImports(source);
    const otherLines: string[] = this.findOtherLines(source, importLines);
    const toInsert: string = this.buildLineToInsert(symbol, relativePath);
    importLines.push(toInsert);
    return importLines
      .join('\n')
      .concat(otherLines.join('\n'));
  }

  private static findImports(source: string): string[] {
    return source
      .split('\n')
      .filter((line) => line.match(/import {/));
  }

  private static findOtherLines(source: string, importLines: string[]) {
    return source
      .split('\n')
      .filter((line) => importLines.indexOf(line) < 0);
  }

  private static buildLineToInsert(symbol: string, relativePath: string): string {
    return `import { ${ symbol } } from '${ relativePath }';\n`;
  }
}
