import { normalizeToKebabOrSnakeCase } from '../../src/utils';

describe('normalizeToKebabOrSnakeCase', () => {
  it('should convert camelCase to kebab-case', () => {
    const input = 'camelCaseString';
    const output = normalizeToKebabOrSnakeCase(input);
    expect(output).toBe('camel-case-string');
  });

  it('should replace spaces with dashes', () => {
    const input = 'string with spaces';
    const output = normalizeToKebabOrSnakeCase(input);
    expect(output).toBe('string-with-spaces');
  });

  it('should keep underscores', () => {
    const input = 'string_with_underscores';
    const output = normalizeToKebabOrSnakeCase(input);
    expect(output).toBe('string_with_underscores');
  });

  it('should handle empty string', () => {
    const input = '';
    const output = normalizeToKebabOrSnakeCase(input);
    expect(output).toBe('');
  });

  it('should handle strings with leading/trailing spaces', () => {
    const input = '  leading and trailing spaces  ';
    const output = normalizeToKebabOrSnakeCase(input);
    expect(output).toBe('leading-and-trailing-spaces');
  });
});
