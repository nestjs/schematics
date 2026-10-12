import { Tree } from '@angular-devkit/schematics';
import { findNestCliConfigPath } from '../../src/utils/nest-cli-config.util.js';

describe('findNestCliConfigPath', () => {
  it('should prefer nest-cli.json over .nest-cli.json', () => {
    const tree = Tree.empty();
    tree.create('.nest-cli.json', '{}');
    tree.create('nest-cli.json', '{}');

    expect(findNestCliConfigPath(tree)).toBe('nest-cli.json');
  });

  it('should fall back to .nest-cli.json', () => {
    const tree = Tree.empty();
    tree.create('.nest-cli.json', '{}');

    expect(findNestCliConfigPath(tree)).toBe('.nest-cli.json');
  });

  it('should ignore the names the CLI no longer loads', () => {
    const tree = Tree.empty();
    tree.create('.nestcli.json', '{}');
    tree.create('nest.json', '{}');

    expect(findNestCliConfigPath(tree)).toBeUndefined();
  });
});
