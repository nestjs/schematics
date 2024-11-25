import { Path } from '@angular-devkit/core';
import { capitalize, classify } from '@angular-devkit/core/src/utils/strings';
import { ModuleImportDeclarator } from './module-import.declarator';
import { ModuleMetadataDeclarator } from './module-metadata.declarator';

export interface DeclarationOptions {
  metadata: string;
  type?: string;
  name: string;
  className?: string;
  path: Path;
  module: Path;
  symbol?: string;
  staticOptions?: {
    name: string;
    value: Record<string, any>;
  };
}

export class ModuleDeclarator {
  /**
   * Constructs a new `ModuleDeclarator` instance.
   *
   * @param imports - The `ModuleImportDeclarator` instance for handling import declarations.
   * @param metadata - The `ModuleMetadataDeclarator` instance for handling metadata declarations.
   */
  constructor(
    private imports: ModuleImportDeclarator = new ModuleImportDeclarator(),
    private metadata: ModuleMetadataDeclarator = new ModuleMetadataDeclarator(),
  ) {}

  /**
   * Declares module imports and metadata in the given content string.
   *
   * @param content - The content of the file where the declarations will be made.
   * @param options - The options for the declaration, including the symbol and static options.
   * @returns The updated content string with the declarations inserted.
   */
  public declare(content: string, options: DeclarationOptions): string {
    options = this.computeSymbol(options);
    content = this.imports.declare(content, options);
    content = this.metadata.declare(content, options);
    return content;
  }

  /**
   * Computes the symbol for the declaration options if not provided.
   *
   * @param options - The options for the declaration.
   * @returns The updated declaration options with the computed symbol.
   */
  private computeSymbol(options: DeclarationOptions): DeclarationOptions {
    const target = Object.assign({}, options);
    if (options.className) {
      target.symbol = options.className;
    } else if (options.type !== undefined) {
      target.symbol = classify(options.name).concat(capitalize(options.type));
    } else {
      target.symbol = classify(options.name);
    }
    return target;
  }
}
