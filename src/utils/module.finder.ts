import { join, normalize, Path, PathFragment } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';

export interface FindOptions {
  name?: string;
  path: string;
  kind: 'module' | 'controller' | 'service';
}

export class ModuleFinder {
  private readonly ROOT_PATH: Path = normalize('/src');

  constructor(private tree: Tree) {}

  public find(options: FindOptions): Path {
    const generatedDirectoryPath: Path = join(this.ROOT_PATH, normalize(options.path));
    const generatedDirectory: DirEntry = this.tree.getDir(generatedDirectoryPath);
    return this.findIn(generatedDirectory, options);
  }

  private findIn(directory: DirEntry, options: FindOptions): Path {
    const moduleFilename: PathFragment = directory
      .subfiles
      .find((filename) =>
        filename.includes('.module.ts')
        &&
        (options.kind !== 'module' || !filename.includes(options.name))
      );
    return moduleFilename !== undefined ?
      join(directory.path, moduleFilename.valueOf())
      :
      this.findIn(directory.parent, options);
  }
}
