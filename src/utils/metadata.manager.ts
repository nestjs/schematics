export class MetadataManager {
  private inserted: boolean;
  private config: boolean;
  private metadata: boolean;
  private existing: boolean;

  constructor(private content: string) {
    this.inserted = false;
    this.config = false;
    this.metadata = false;
    this.existing = false;
  }

  public insert(metadata: string, symbol: string): string {
    const characters: string[] = this.content.split('');
    return characters.reduce((content, character, index) => {
      if (!this.inserted) {
        if (!this.metadata && content.match(/@Module\(\{/)) {
          this.metadata = true;
        }
        if (this.metadata) {
          if (content.match(metadata)) {
            content = this.insertSymbolInMetadata(content, character, metadata, symbol);
          } else {
            content = this.insertNewMetadataAndSymbol(content, character, index, metadata, symbol);
          }
        }
      }
      return `${ content }${ character }`;
    }, '');
  }

  private insertNewMetadataAndSymbol(content: string, character: string, index: number, metadata: string, symbol: string): string {
    if (character === '[') {
      this.existing = true;
    }
    if (character === '}') {
      this.metadata = false;
    }
    if (!this.metadata) {
      this.inserted = true;
      if (this.existing) {
        return content.slice(0, index - 1).concat(`,\n  ${ metadata }: [\n    ${ symbol }\n  ]\n`);
      } else {
        return content.concat(`\n  ${ metadata }: [\n    ${ symbol }\n  ]\n`);
      }
    }
    return content;
  }

  private insertSymbolInMetadata(content: string, character: string, metadata: string, symbol: string): string {
    if (!this.inserted) {
      if (character === '(') {
        this.config = true;
      } else if (character === ')') {
        this.config = false;
      } else if (!this.config && character === ']') {
        this.inserted = true;
        return content.slice(0, content.lastIndexOf('\n')).concat(`,\n    ${ symbol }\n  `);
      }
    }
    return content;
  }
}