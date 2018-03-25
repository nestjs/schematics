import { Path } from '@angular-devkit/core';
import { capitalize, classify } from '@angular-devkit/core/src/utils/strings';
import { ModuleImportDeclarator } from './module-import.declarator';
import { ModuleMetadataDeclarator } from './module-metadata.declarator';

export interface DeclarationOptions {
  metadata: string;
  type: string;
  name: string;
  path: Path;
  module: Path;
  symbol?: string;
}

export class ModuleDeclarator {
  constructor(
    private imports: ModuleImportDeclarator = new ModuleImportDeclarator(),
    private metadata: ModuleMetadataDeclarator = new ModuleMetadataDeclarator()) {}

  public declare(content: string, options: DeclarationOptions): string {
    options = this.computeSymbol(options);
    content = this.imports.declare(content, options);
    content = this.metadata.declare(content, options);
    return content;
  }

  private computeSymbol(options: DeclarationOptions): DeclarationOptions {
    let target: DeclarationOptions = Object.assign({}, options);
    target.symbol = classify(options.name).concat(capitalize(options.type));
    return target;
  }
}