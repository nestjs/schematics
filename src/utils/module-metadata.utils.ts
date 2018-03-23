export interface ModuleMetadata {
  imports?: any[];
}

export class ModuleMetadataUtils {
  private static METADATA_REGEXP: RegExp = /@Module\(([\s\S]*?)\)/;

  public static insert(source: string, symbol: string): string {
    const metadata: ModuleMetadata = this.extract(source);
    return source
      .replace(
        this.METADATA_REGEXP,
        `@Module(${ JSON.stringify(this.addSymbol(metadata, symbol), null, 2) })`
      )
      .replace(/"/g, '');
  }

  private static extract(source: string): ModuleMetadata {
    const results: RegExpExecArray | null = this.METADATA_REGEXP.exec(source);
    return <ModuleMetadata> JSON.parse(
      results[1]
        .replace(/([a-zA-Z]+)/g, '"$1"')
        .replace(/(,)(\n})/, '$2')
    );
  }

  private static addSymbol(metadata: ModuleMetadata, symbol: string): ModuleMetadata {
    const updatedMetadata: ModuleMetadata = Object.assign({}, metadata);
    if (updatedMetadata.imports === undefined) {
      updatedMetadata.imports = [ symbol ];
    } else {
      updatedMetadata.imports.push(symbol);
    }
    return updatedMetadata;
  }
}
