export class ModuleMetadataUtils {
  public static insert(source: string, symbol: string): string {
    const importsLine: string = source
      .split('\n')
      .find((line) => line.match(/imports/))
      .replace(/\[\]/, `[ ${ symbol } ],\n`);
    return source.replace(/imports/, importsLine);
  }
}
