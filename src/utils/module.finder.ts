import { join, normalize, Path, PathFragment } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';

export interface FindOptions {
  name?: string;
  path: Path;
  kind?: 'module' | 'controller' | 'service';
}

export class ModuleFinder {
  constructor(private tree: Tree) {}

  public find(options: FindOptions): Path {
    console.log(options);
    const generatedDirectoryPath: Path = join(options.path, options.name);
    const generatedDirectory: DirEntry = this.tree.getDir(generatedDirectoryPath);
    return this.findIn(generatedDirectory);
  }

  private findIn(directory: DirEntry): Path {
    const moduleFilename: PathFragment = directory
      .subfiles
      .find((filename) => filename.includes('.module.ts'));
    return moduleFilename !== undefined ?
      join(directory.path, moduleFilename.valueOf())
      :
      this.findIn(directory.parent);
  }
}
