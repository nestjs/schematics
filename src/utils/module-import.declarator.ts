import { normalize, Path } from '@angular-devkit/core';
import { DeclarationOptions } from './module.declarator';
import { PathSolver } from './path.solver';

/**
 * The `ModuleImportDeclarator` class is responsible for declaring module imports
 * in a TypeScript file. It provides methods to insert import statements into the
 * file content based on the provided declaration options.
 */
export class ModuleImportDeclarator {
  constructor(private solver: PathSolver = new PathSolver()) {}

  /**
   * Declares a module import in the given content string.
   *
   * @param content - The content of the file where the import will be declared.
   * @param options - The options for the declaration, including the symbol and path.
   * @returns The updated content string with the import statement inserted.
   */
  public declare(content: string, options: DeclarationOptions): string {
    const toInsert = this.buildLineToInsert(options);
    const contentLines = content.split('\n');
    const finalImportIndex = this.findImportsEndpoint(contentLines);
    contentLines.splice(finalImportIndex + 1, 0, toInsert);
    return contentLines.join('\n');
  }

  /**
   * Finds the endpoint of the existing import statements in the content.
   *
   * @param contentLines - The lines of the content.
   * @returns The index of the last import statement.
   */
  private findImportsEndpoint(contentLines: string[]): number {
    const reversedContent = Array.from(contentLines).reverse();
    const reverseImports = reversedContent.filter((line) =>
      line.match(/\} from ('|")/),
    );
    if (reverseImports.length <= 0) {
      return 0;
    }
    return contentLines.indexOf(reverseImports[0]);
  }

  /**
   * Builds the import line to insert based on the declaration options.
   *
   * @param options - The options for the declaration, including the symbol and path.
   * @returns The import line to insert.
   */
  private buildLineToInsert(options: DeclarationOptions): string {
    return `import { ${options.symbol} } from '${this.computeRelativePath(
      options,
    )}';`;
  }

  /**
   * Computes the relative path for the import statement.
   *
   * @param options - The options for the declaration, including the symbol and path.
   * @returns The relative path for the import statement.
   */
  private computeRelativePath(options: DeclarationOptions): string {
    let importModulePath: Path;
    if (options.type !== undefined) {
      importModulePath = normalize(
        `/${options.path}/${options.name}.${options.type}`,
      );
    } else {
      importModulePath = normalize(`/${options.path}/${options.name}`);
    }
    return this.solver.relative(options.module, importModulePath);
  }
}
