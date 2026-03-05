import { normalize, Path } from '@angular-devkit/core';
import { PathSolver } from '../../src/utils/path.solver.js';

describe('Path Solver', () => {
  it('should relative path between path', () => {
    const solver = new PathSolver();
    const from: Path = normalize('/src/app.module.ts');
    const to: Path = normalize('/src/foo/foo.module');
    expect(solver.relative(from, to)).toEqual('./foo/foo.module');
  });
});
