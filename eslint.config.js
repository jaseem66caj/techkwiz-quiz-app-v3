const nextPlugin = require('@next/eslint-plugin-next');
const importPlugin = require('eslint-plugin-import');
const reactPlugin = require('eslint-plugin-react');
const typescriptEslintParser = require('@typescript-eslint/parser');
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');

module.exports = [
  {
    ignores: ['.next/', 'playwright-report/', 'node_modules/', 'public/'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      'import': importPlugin,
      'react': reactPlugin,
      '@typescript-eslint': typescriptEslintPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-unused-state": "error",
      "import/no-duplicates": "error",
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "never"
      }],
      "react/prop-types": "off",
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      'import': importPlugin,
      'react': reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "prefer-const": "error",
      "no-var": "error",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-unused-state": "error",
      "import/no-duplicates": "error",
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "never"
      }],
      "react/prop-types": "off",
    },
  },
  {
    files: ['scripts/**/*.js', 'tests/**/*.js'],
    rules: {
      "no-console": "off",
    },
  },
];
