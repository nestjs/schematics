import { basename, dirname, Path, relative } from '@angular-devkit/core';

export class PathSolver {
  constructor() {}

  public relative(from: Path, to: Path): string {
    const relativeDir: Path = relative(dirname(from), dirname(to));
    return (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir)
      .concat(relativeDir.length === 0 ? basename(to) : '/' + basename(to));
  }
}
