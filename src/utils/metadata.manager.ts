export class MetadataManager {
  private emptyMetadataMatched: boolean;
  private startModuleTokenMatched: boolean;
  private endModuleTokenMatched: boolean;
  private startMetadataTokenMatched: boolean;
  private endMetadataTokenMatched: boolean;
  private startConfigTokenMatched: boolean;
  private endConfigTokenMatched: boolean;
  private multiLineMetadataMatched: boolean;
  
  private inserted: boolean;

  constructor(private content: string) {
    this.emptyMetadataMatched = false;
    this.startModuleTokenMatched = false;
    this.endModuleTokenMatched = false;
    this.startMetadataTokenMatched = false;
    this.endMetadataTokenMatched = false;
    this.startConfigTokenMatched = false;
    this.endConfigTokenMatched = false;
    this.multiLineMetadataMatched = false;
    this.inserted = false;
  }

  public insert(metadata: string, symbol: string): string {
    const lines: string[] = this.content.split(/\n/);
    return lines.reduce((content, line, lineIndex) => {
      if (lineIndex === lines.length - 1) {
        return content;
      }

      if (line.match(/@Module\(\{\}\)/)) {
        this.emptyMetadataMatched = true;
      } else if (line.match(/@Module\(\{/)) {
        this.startModuleTokenMatched = true;
      } else if (line.match(metadata)) {
        if (line.match(/\[/)) {
          this.startMetadataTokenMatched = true;
        }
        if (line.match(/\]/)) {
          this.endMetadataTokenMatched = true;
        } else {
          this.multiLineMetadataMatched = true;
        }
      } else if (this.startModuleTokenMatched && line.match(/\}\)/)) {
        this.endModuleTokenMatched = true;
      } else if (this.startMetadataTokenMatched && line.match(/\]/)) {
        this.endMetadataTokenMatched = true;
      }

      if (!this.inserted) {
        if (this.emptyMetadataMatched) {
          this.inserted = true;
          line = line.split(/\{/).join(`{\n  ${ metadata }: [${ symbol }]\n`);
        } else if (this.endModuleTokenMatched && !this.startMetadataTokenMatched) {
          this.inserted = true;
          line = `  ${ metadata}: [${ symbol }]\n${ line }`;
          return `${ content.slice(0, content.length - 1)},\n${ line }\n`;
        } else if (this.startMetadataTokenMatched && this.endMetadataTokenMatched && !this.endModuleTokenMatched) {
          const characters: string[] = line.split('');
          line = characters.reduce((lineContent, character, characterIndex) => {
            if (character.match(/\(/)) {
              this.startConfigTokenMatched = true;
            } else if (this.startConfigTokenMatched && character.match(/\)/)) {
              this.endConfigTokenMatched = true;
            }

            if ((!this.startConfigTokenMatched || this.startConfigTokenMatched && this.endConfigTokenMatched) && character.match(/\]/)) {
              if (this.multiLineMetadataMatched) {
                return `${ lineContent }${ symbol }\n  ${ character }`;
              } else {
                const previousCharacter: string = characters[ characterIndex - 1];
                if (previousCharacter.match(/,/)) {
                  return `${ lineContent } ${ symbol }${ character }`;
                } else {
                  return `${ lineContent }, ${ symbol }${ character }`;
                }
              }
            } else {
              return `${ lineContent }${ character }`;
            }
          }, '');
          this.inserted = true;
          if (this.multiLineMetadataMatched) {
            const previousLine: string = lines[ lineIndex - 1];
            if (previousLine.match(/\//) || previousLine.match(/,/)) {
              return `${ content }  ${ line }\n`;
            } else {
              return `${ content.slice(0, content.length - 1) },\n  ${ line }\n`;
            }
          }
        } 
      }
      return `${ content }${ line }\n`;
    }, '');
  }
}