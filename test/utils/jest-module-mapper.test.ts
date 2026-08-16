import { createModuleNameMapper } from '../../src/utils/jest-module-mapper.js';

describe('createModuleNameMapper', () => {
  it('should map a package key to its root', () => {
    expect(
      createModuleNameMapper('@app/hello', '<rootDir>/libs/hello/src'),
    ).toEqual({
      '^@app/hello(|/.*)$': '<rootDir>/libs/hello/src/$1',
    });
  });

  it('should produce a pattern that matches the bare package key', () => {
    const mapper = createModuleNameMapper(
      '@app/hello',
      '<rootDir>/libs/hello/src',
    );
    const [pattern] = Object.keys(mapper);

    expect(new RegExp(pattern).test('@app/hello')).toBe(true);
  });

  it('should produce a pattern that matches sub-paths', () => {
    const mapper = createModuleNameMapper(
      '@app/hello',
      '<rootDir>/libs/hello/src',
    );
    const [pattern] = Object.keys(mapper);

    expect(new RegExp(pattern).test('@app/hello/nested/thing')).toBe(true);
  });

  it('should not match a package that merely shares the prefix', () => {
    const mapper = createModuleNameMapper(
      '@app/hello',
      '<rootDir>/libs/hello/src',
    );
    const [pattern] = Object.keys(mapper);

    expect(new RegExp(pattern).test('@app/hello-world')).toBe(false);
  });

  it('should resolve a sub-path through the capture group', () => {
    const mapper = createModuleNameMapper(
      '@app/hello',
      '<rootDir>/libs/hello/src',
    );
    const [pattern, replacement] = Object.entries(mapper)[0];

    expect('@app/hello/nested'.replace(new RegExp(pattern), replacement)).toBe(
      '<rootDir>/libs/hello/src//nested',
    );
  });

  it('should support a package key without a scope', () => {
    expect(createModuleNameMapper('hello', '<rootDir>/libs/hello/src')).toEqual(
      {
        '^hello(|/.*)$': '<rootDir>/libs/hello/src/$1',
      },
    );
  });
});
