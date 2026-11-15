// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import { projectRules } from '../../eslint.rules.mjs';

export default defineConfig([
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    // Type-aware linting: needed by no-deprecated and no-floating-promises.
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...projectRules,
      // Carried over from the generated oxlint config; still to decide (see PR #1).
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
