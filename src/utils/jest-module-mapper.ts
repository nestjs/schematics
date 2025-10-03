/**
 * Creates a unified moduleNameMapper configuration for Jest.
 * Uses the correct format from package.json: ^packageKey(|/.*)$ pattern
 * @param packageKey The package key (e.g., '@app/hello')
 * @param packageRoot The package root path (e.g., '<rootDir>/libs/hello/src')
 * @returns Record containing moduleNameMapper entries
 */
export function createModuleNameMapper(
  packageKey: string,
  packageRoot: string,
): Record<string, string> {
  const moduleNameMapper: Record<string, string> = {};

  // Use the correct format from package.json: ^packageKey(|/.*)$
  // This handles both exact match (@app/hello) and sub-paths (@app/hello/submodule)
  const packageKeyRegex = '^' + packageKey + '(|/.*)$';
  moduleNameMapper[packageKeyRegex] = packageRoot + '/$1';

  return moduleNameMapper;
}
