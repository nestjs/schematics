import { DeclarationOptions } from './module.declarator';
import { MetadataManager } from './metadata.manager';

export class ModuleMetadataDeclarator {
  
  public declare(content: string, options: DeclarationOptions): string {
    const manager = new MetadataManager(content);
    const inserted = manager.insert(options.metadata, options.symbol);
    return inserted;
  }
}
