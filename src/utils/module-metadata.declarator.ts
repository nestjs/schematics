import { DeclarationOptions } from './module.declarator';
import { MetadataManager } from './metadata.manager';

export class ModuleMetadataDeclarator {
  
  public declare(content: string, options: DeclarationOptions): string {
    const manager = new MetadataManager(content);
    console.log(content);
    const inserted = manager.insert(options.metadata, options.symbol);
    console.log('- - - -');
    console.log(inserted);
    return inserted;
  }
}
