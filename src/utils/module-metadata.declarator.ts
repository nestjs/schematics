import { MetadataManager } from './metadata.manager';
import { DeclarationOptions } from './module.declarator';

/**
 * The `ModuleMetadataDeclarator` class is responsible for declaring metadata
 * in a TypeScript file. It provides methods to insert metadata entries into the
 * file content based on the provided declaration options.
 */
export class ModuleMetadataDeclarator {
  /**
   * Declares metadata in the given content string.
   *
   * @param content - The content of the file where the metadata will be declared.
   * @param options - The options for the declaration, including the metadata, symbol, and static options.
   * @returns The updated content string with the metadata entry inserted.
   */
  public declare(content: string, options: DeclarationOptions): string {
    const manager = new MetadataManager(content);
    const inserted = manager.insert(
      options.metadata,
      options.symbol,
      options.staticOptions,
    );
    return inserted ?? content;
  }
}
