import { normalize, Path } from '@angular-devkit/core';
import { expect } from 'chai';
import { PathSolver } from '../../src/utils/path.solver';

describe('Path Solver', () => {
  it('should relative path between path', () => {
    const solver = new PathSolver();
    const from: Path = normalize('/src/app.module.ts');
    const to: Path = normalize('/src/foo/foo.module');
    expect(solver.relative(from, to)).to.be.equal('./foo/foo.module');
  });
});
