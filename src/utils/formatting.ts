import {
  camelCase,
  kebabCase,
  pascalCase,
  snakeCase
} from 'case-anything';

export type CaseType =
  | 'camel'
  | 'kebab'
  | 'snake'
  | 'pascal'
  | 'kebab-or-snake';

/**
 *
 * @param str
 * @param caseType CaseType
 * @returns formatted string
 * @description normalizes input to a given case format.
 */
export const normalizeToCase = (
  str: string,
  caseType: CaseType = 'kebab',
) => {
  switch (caseType) {
    case 'camel':
      return camelCase(str);
    case 'kebab':
      return kebabCase(str);
    case 'pascal':
      return pascalCase(str);
    case 'snake':
      return snakeCase(str);
    case 'kebab-or-snake':
      return kebabCase(str, { keep: ['_', '@', '/', '.'] })
    default:
      throw new Error(`Case type ${caseType} is not supported.`);
  }
};

/**
 * @param str
 * @returns formatted string
 * @description escapes parenthesis and brackets in a string
 **/

export const formatString = (str: string) => {
  return str.split('').reduce((content, char) => {
    if (char === '(' || char === ')' || char === '[' || char === ']') {
      return `${content}\\${char}`;
    }
    return `${content}${char}`;
  }, '');
};

/**
 *
 * @param str
 * @returns formated string
 * @description normalizes input to supported path and file name format.
 * Changes camelCase strings to kebab-case, replaces spaces with dash and keeps underscores.
 */
export function normalizeToKebabOrSnakeCase(str: string) {
  const STRING_DASHERIZE_REGEXP = /\s/g;
  const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
  return str
    .replace(STRING_DECAMELIZE_REGEXP, '$1-$2')
    .toLowerCase()
    .replace(STRING_DASHERIZE_REGEXP, '-');
}
