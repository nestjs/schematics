export interface ModuleMetadata {
  imports?: any[];
}

export class ModuleMetadataUtils {
  private static METADATA_REGEXP: RegExp = /@Module\((.*)\)/;

  public static insert(source: string, symbol: string): string {
    const metadata: ModuleMetadata = this.extract(source);
    return source
      .replace(
        this.METADATA_REGEXP,
        `@Module(${ JSON.stringify(this.addSymbol(metadata, symbol), null, 2) })`
      );
  }

  private static extract(source: string): ModuleMetadata {
    const results: RegExpExecArray | null = this.METADATA_REGEXP.exec(source);
    return <ModuleMetadata> JSON.parse(results[1]);
  }

  private static addSymbol(metadata: ModuleMetadata, symbol: string): ModuleMetadata {
    const updatedMetadata: ModuleMetadata = Object.assign({}, metadata);
    if (updatedMetadata.imports === undefined) {
      updatedMetadata.imports = [ symbol ];
    }
    return updatedMetadata;
  }
}
