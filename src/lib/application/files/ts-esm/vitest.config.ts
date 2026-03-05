import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    rootDir: '.',
    testRegex: '.*\.spec\.ts$',
    root: './',
  },
});
