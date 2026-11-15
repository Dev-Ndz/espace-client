import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          // The e2e files share one test database, so they run one after the other.
          fileParallelism: false,
          include: ['test/**/*.e2e-spec.ts'],
          globalSetup: ['test/support/global-setup.ts'],
          setupFiles: ['test/support/e2e-setup.ts'],
        },
      },
    ],
  },
});
