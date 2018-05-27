import { join, Path, PathFragment } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';

export interface FindOptions {
  name?: string;
  path: Path;
  kind?: string;
}

export class ModuleFinder {
  constructor(private tree: Tree) {}

  public find(options: FindOptions): Path {
    const generatedDirectoryPath: Path = options.path;
    const generatedDirectory: DirEntry = this.tree.getDir(generatedDirectoryPath);
    return this.findIn(generatedDirectory);
  }

  private findIn(directory: DirEntry): Path {
    const moduleFilename: PathFragment = directory
      .subfiles
      .find((filename) => /\.module\.(t|j)s/.test(filename));
    return moduleFilename !== undefined ?
      join(directory.path, moduleFilename.valueOf())
      :
      this.findIn(directory.parent);
  }
}
