import { join, Path, PathFragment } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';

export class ModuleFindUtils {
  public static find(tree: Tree, generateDirectoryPath: string): string {
    const directory: DirEntry = tree.getDir(generateDirectoryPath);
    const files: PathFragment[] = directory.subfiles;
    const moduleFilename: string = files.find((filename) => filename.match(/\.module\.ts/));
    return moduleFilename !== undefined ? join(generateDirectoryPath as Path, moduleFilename) : '/src/app.module.ts';
  }
}