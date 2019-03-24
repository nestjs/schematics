import { MetadataManager } from './metadata.manager';
import { DeclarationOptions } from './module.declarator';

export class ModuleMetadataDeclarator {
  public declare(content: string, options: DeclarationOptions): string {
    const manager = new MetadataManager(content);
    const inserted = manager.insert(
      options.metadata,
      options.symbol,
      options.staticOptions,
    );
    return inserted;
  }
}
