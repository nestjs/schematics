import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    rootDir: '.',
    testRegex: '.e2e-spec.ts$',
    root: './',
  },
});
