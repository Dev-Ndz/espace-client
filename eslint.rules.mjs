// Project rules shared by every app's ESLint config (apps/api, apps/web).
// Plain data, no imports: each app brings its own ESLint and typescript-eslint.
export const projectRules = {
  // The shared package only holds API contracts for now: type-only imports.
  'no-restricted-imports': [
    'error',
    {
      paths: [
        {
          name: '@espace-client/shared',
          allowTypeImports: true,
          message: 'For now, the shared package may only be imported with `import type`.',
        },
      ],
    },
  ],
  // With type-aware linting, typescript-eslint skips files that contain decorators when
  // `experimentalDecorators` and `emitDecoratorMetadata` are on (Nest), so injected providers
  // are never pushed to `import type`.
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/no-deprecated': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
};
