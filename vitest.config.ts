import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    globals: true,
    include: ['src/**/*.test.ts', 'test/**/*.test.ts', 'test/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'src/**/files/**'],
    testTimeout: 15000,
    pool: 'forks',
    // Schematic runs share the collection loaded from disk; keep them in one
    // process to avoid re-resolving it per worker.
    fileParallelism: false,
  },
});
