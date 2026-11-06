import { normalize } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
import { FindOptions, ModuleFinder } from '../../src/utils/module.finder.js';

describe('Module Finder', () => {
  it('should return the app module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'foo',
      path: normalize('/src'),
    };
    expect(finder.find(options)).toEqual(normalize('/src/app.module.ts'));
  });
  it('should return the intermediate module path', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.ts', 'app module content');
    tree.create('/src/foo/foo.module.ts', 'foo module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'name',
      path: normalize('/src/foo'),
    };
    expect(finder.find(options)).toEqual(normalize('/src/foo/foo.module.ts'));
  });
  it('should manage javascript module file', () => {
    const tree = new EmptyTree();
    tree.create('/src/app.module.js', 'app module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'foo',
      path: normalize('/src'),
    };
    expect(finder.find(options)).toEqual(normalize('/src/app.module.js'));
  });

  it('should return null when directory does not exist', () => {
    const tree = new EmptyTree();

    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'foo',
      path: normalize('/src'),
    };
    expect(finder.find(options)).toEqual(null);
  });

  it('should ignore vim swap files', () => {
    const tree = new EmptyTree();
    tree.create('/src/foo/foo.module.ts.swp', 'foo module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'name',
      path: normalize('/src/foo'),
    };
    expect(finder.find(options)).toEqual(null);
  });

  it('should prefer the module file matching the name', () => {
    const tree = new EmptyTree();
    tree.create('/src/users/admin.module.ts', 'admin module content');
    tree.create('/src/users/users.module.ts', 'users module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'users',
      path: normalize('/src/users'),
    };
    expect(finder.find(options)).toEqual(
      normalize('/src/users/users.module.ts'),
    );
  });

  it('should prefer the module file matching the name regardless of creation order', () => {
    const tree = new EmptyTree();
    tree.create('/src/admin/users.module.ts', 'users module content');
    tree.create('/src/admin/admin.module.ts', 'admin module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'admin',
      path: normalize('/src/admin'),
    };
    expect(finder.find(options)).toEqual(
      normalize('/src/admin/admin.module.ts'),
    );
  });

  it('should prefer the javascript module file matching the name', () => {
    const tree = new EmptyTree();
    tree.create('/src/users/admin.module.js', 'admin module content');
    tree.create('/src/users/users.module.js', 'users module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'users',
      path: normalize('/src/users'),
    };
    expect(finder.find(options)).toEqual(
      normalize('/src/users/users.module.js'),
    );
  });

  it('should return the first module file when none matches the name', () => {
    const tree = new EmptyTree();
    tree.create('/src/users/admin.module.ts', 'admin module content');
    tree.create('/src/users/users.module.ts', 'users module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'foo',
      path: normalize('/src/users'),
    };
    expect(finder.find(options)).toEqual(
      normalize('/src/users/admin.module.ts'),
    );
  });

  it('should not prefer the module file matching the name in a parent directory', () => {
    const tree = new EmptyTree();
    tree.create('/src/admin.module.ts', 'admin module content');
    tree.create('/src/users.module.ts', 'users module content');
    const finder = new ModuleFinder(tree);
    const options: FindOptions = {
      name: 'users',
      path: normalize('/src/users'),
    };
    expect(finder.find(options)).toEqual(normalize('/src/admin.module.ts'));
  });

  describe('when the root module is declared in the entry file', () => {
    const entryFile = '@Module({\n  controllers: [],\n})\nclass AppModule {}\n';

    it('should return the entry file', () => {
      const tree = new EmptyTree();
      tree.create('/src/main.ts', entryFile);
      const finder = new ModuleFinder(tree);
      const options: FindOptions = {
        name: 'users',
        path: normalize('/src/users'),
      };
      expect(finder.find(options)).toEqual(normalize('/src/main.ts'));
    });

    it('should prefer a module file in the same directory', () => {
      const tree = new EmptyTree();
      tree.create('/src/main.ts', entryFile);
      tree.create('/src/app.module.ts', 'app module content');
      const finder = new ModuleFinder(tree);
      const options: FindOptions = {
        name: 'users',
        path: normalize('/src/users'),
      };
      expect(finder.find(options)).toEqual(normalize('/src/app.module.ts'));
    });

    it('should prefer a closer module file', () => {
      const tree = new EmptyTree();
      tree.create('/src/main.ts', entryFile);
      tree.create('/src/users/users.module.ts', 'users module content');
      const finder = new ModuleFinder(tree);
      const options: FindOptions = {
        name: 'profile',
        path: normalize('/src/users/profile'),
      };
      expect(finder.find(options)).toEqual(
        normalize('/src/users/users.module.ts'),
      );
    });

    it('should not take an entry file that only bootstraps a module', () => {
      const tree = new EmptyTree();
      tree.create(
        '/src/main.ts',
        "import { AppModule } from './somewhere/app';\nNestFactory.create(AppModule);\n",
      );
      const finder = new ModuleFinder(tree);
      const options: FindOptions = {
        name: 'users',
        path: normalize('/src/users'),
      };
      expect(finder.find(options)).toEqual(null);
    });

    it('should not take any other file that declares a module', () => {
      const tree = new EmptyTree();
      tree.create('/src/app.ts', entryFile);
      const finder = new ModuleFinder(tree);
      const options: FindOptions = {
        name: 'users',
        path: normalize('/src/users'),
      };
      expect(finder.find(options)).toEqual(null);
    });
  });
});
