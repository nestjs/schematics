import { DeclarationOptions } from './module.declarator';

export class ModuleMetadataDeclarator {
  private METADATA_REGEXP: RegExp = /@Module\(([\s\S]*?)\)/;

  constructor() {}

  public declare(content: string, options: DeclarationOptions): string {
    const metadata: any = this.extract(content);
    return content
      .replace(
        this.METADATA_REGEXP,
        `@Module(${ JSON.stringify(this.addSymbol(metadata, options), null, 2) })`
      )
      .replace(/"/g, '');
  }

  private extract(source: string): any {
    const results: RegExpExecArray | null = this.METADATA_REGEXP.exec(source);
    return JSON.parse(
      results[ 1 ]
        .replace(/([a-zA-Z]+)/g, '"$1"')
        .replace(/(,)(\n})/, '$2')
    );
  }

  private addSymbol(metadata: any, options: DeclarationOptions): any {
    const updatedMetadata: any = Object.assign({}, metadata);
    if (updatedMetadata[ options.metadata ] === undefined) {
      updatedMetadata[ options.metadata ] = [ options.symbol ];
    } else {
      updatedMetadata[ options.metadata ].push(options.symbol);
    }
    return updatedMetadata;
  }
}
