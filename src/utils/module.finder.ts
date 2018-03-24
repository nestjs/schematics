import { join, normalize, Path, PathFragment, split } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';

export interface FindOptions {
  name?: string;
  path: string;
  kind: 'module' | 'controller' | 'service';
}

export class ModuleFinder {
  private readonly ROOT_PATH: Path = normalize('/src');

  constructor(private tree: Tree) {}

  public find(options: FindOptions): string {
    const generatedDirectoryPath: Path = join(this.ROOT_PATH, normalize(options.path));
    const generatedDirectory: DirEntry = this.tree.getDir(generatedDirectoryPath);
    const moduleFilename: PathFragment = generatedDirectory
      .subfiles
      .find((filename) =>
        filename.includes('.module.ts')
        &&
        (options.kind !== 'module' || !filename.includes(options.name))
      );
    return moduleFilename !== undefined ?
      join(generatedDirectoryPath, moduleFilename.valueOf())
      :
      this.findInParent(options);
  }

  private findInParent(options: FindOptions): string {
    const copyOfOptions: FindOptions = Object.assign({}, options);
    copyOfOptions.path = this.computeParentPath(options.path);
    return this.find(copyOfOptions);
  }

  private computeParentPath(path: string): string {
    const fragments: PathFragment[] = split(normalize(path));
    fragments.pop();
    return fragments.length === 0 ? '' : join(...fragments).valueOf();
  }
}
