import globals from 'globals';
import eslintRecommended from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Ignore all JavaScript files
  {
    ignores: ['**/*.js'],
  },

  // Base ESLint recommended rules
  eslintRecommended.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Your custom configuration
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node, // Node.js global variables
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Turn off ESLint rules that conflict with Prettier
  prettierConfig,
];
