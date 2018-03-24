import { EmptyTree } from '@angular-devkit/schematics';
import { expect } from 'chai';
import { ModuleFindUtils } from '../../src/utils/module-find.utils';

describe('Module Find Utils', () => {
  it('should return the app module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    expect(ModuleFindUtils.find(tree, '/src/name'))
      .to.equal('/src/app.module.ts');
  });
  it('should return the generated directory module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    tree.create('/src/name/name.module.ts', 'name module content');
    expect(ModuleFindUtils.find(tree, '/src/name'))
      .to.equal('/src/name/name.module.ts');
  });
  it.skip('should return the intermediate module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    tree.create('/src/nested/nested.module.ts', 'nested module content');
    tree.create('/src/nested/name/name.module.ts', 'name module content');
    expect(ModuleFindUtils.find(tree, '/src/nested/name'))
      .to.equal('/src/name/name.module.ts');
  });
});
