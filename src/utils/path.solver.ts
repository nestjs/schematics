import { basename, dirname, Path, relative } from '@angular-devkit/core';

export class PathSolver {
  /**
   * Computes the relative path between two paths.
   *
   * @param from - The source path.
   * @param to - The target path.
   * @returns The relative path between the two paths.
   */
  public relative(from: Path, to: Path): string {
    const placeholder = '/placeholder';
    const relativeDir = relative(
      dirname((placeholder + from) as Path),
      dirname((placeholder + to) as Path),
    );
    return (
      relativeDir.startsWith('.') ? relativeDir : './' + relativeDir
    ).concat(relativeDir.length === 0 ? basename(to) : '/' + basename(to));
  }
}
