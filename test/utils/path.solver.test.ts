import { basename, dirname, normalize, Path, relative } from '@angular-devkit/core';
import { expect } from 'chai';

export class PathSolver {
  constructor() {}

  public relative(from: Path, to: Path): string {
    const relativeDir: Path = relative(dirname(from), dirname(to));
    return (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir)
      .concat(relativeDir.length === 0 ? basename(to) : '/' + basename(to));
  }
}

describe('Path Solver', () => {
  it('should relative path between path', () => {
    const solver = new PathSolver();
    const from: Path = normalize('/src/app.module.ts');
    const to: Path = normalize('/src/foo/foo.module');
    expect(solver.relative(from, to)).to.be.equal('./foo/foo.module');
  });
});
