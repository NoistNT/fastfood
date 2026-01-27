import type { Linter } from 'eslint';

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import next from 'eslint-config-next';

export default [
  js.configs.recommended,
  ...next,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        crypto: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-refresh': reactRefreshPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...prettier.rules,
      'prettier/prettier': ['error'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-no-useless-fragment': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': [
        'error',
        {
          'groups': ['type', 'builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'pathGroups': [{ pattern: '@/*', group: 'internal', position: 'after' }],
          'newlines-between': 'always',
        },
      ],
    },
    settings: {
      'react': { version: 'detect' },
      'import/resolver': { typescript: true, node: true },
    },
  },
  {
    files: ['modules/core/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      'import/order': 'warn',
      // Allow @ts-expect-error comments in tests for complex mocking scenarios
      '@typescript-eslint/ban-ts-comment': 'warn',
      // Allow non-null assertions in tests where we know the value exists
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  {
    files: ['app/api/**/*.ts', 'lib/**/*.ts'],
    rules: {
      'no-console': 'off', // Allow console logging in API routes and utilities
    },
  },
  {
    files: ['modules/core/components/performance-monitor.tsx'],
    rules: {
      'no-console': 'off', // Performance monitoring needs console statements
    },
  },
  {
    files: ['modules/core/components/data-table.tsx'],
    rules: {
      'react-hooks/incompatible-library': 'off', // TanStack Table API returns functions that can't be safely memoized
    },
  },
  { ignores: ['.next/**', 'node_modules/**'] },
] as Linter.Config[];
