export class ModuleMetadataUtils {
  private static METADATA_REGEXP: RegExp = /@Module\(([\s\S]*?)\)/;

  public static insert(source: string, key: string, symbol: string): string {
    const metadata: any = this.extract(source);
    return source
      .replace(
        this.METADATA_REGEXP,
        `@Module(${ JSON.stringify(this.addSymbol(metadata, key, symbol), null, 2) })`
      )
      .replace(/"/g, '');
  }

  private static extract(source: string): any {
    const results: RegExpExecArray | null = this.METADATA_REGEXP.exec(source);
    return JSON.parse(
      results[1]
        .replace(/([a-zA-Z]+)/g, '"$1"')
        .replace(/(,)(\n})/, '$2')
    );
  }

  private static addSymbol(metadata: any, key: string, symbol: string): any {
    const updatedMetadata: any = Object.assign({}, metadata);
    if (updatedMetadata[ key ] === undefined) {
      updatedMetadata[ key ] = [ symbol ];
    } else {
      updatedMetadata[ key ].push(symbol);
    }
    return updatedMetadata;
  }
}
