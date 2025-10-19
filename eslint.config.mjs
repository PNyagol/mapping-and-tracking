import globals from 'globals';
import eslintJs from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

// ----------------------------------------------------------------------

const commonRules = {
  ...reactHooksPlugin.configs.recommended.rules,
  'func-names': 1,
  'no-bitwise': 2,
  'no-unused-vars': 0,
  'object-shorthand': 1,
  'no-useless-rename': 1,
  'default-case-last': 2,
  'consistent-return': 2,
  'no-constant-condition': 1,
  'default-case': [2, { commentPattern: '^no default$' }],
  'lines-around-directive': [2, { before: 'always', after: 'always' }],
  // 'arrow-body-style': [2, 'as-needed'],
  // react
  'react/jsx-key': 0,
  'react/prop-types': 0,
  'react/display-name': 0,
  'react/no-children-prop': 0,
  'react/jsx-boolean-value': 2,
  'react/self-closing-comp': 2,
  'react/react-in-jsx-scope': 0,
  'react/jsx-no-useless-fragment': [1, { allowExpressions: true }],
  'react/jsx-curly-brace-presence': [2, { props: 'never', children: 'never' }],
};

const importRules = {
  ...importPlugin.configs.recommended.rules,
  'import/named': 0,
  'import/export': 0,
  'import/default': 0,
  'import/namespace': 0,
  'import/no-named-as-default': 0,
  'import/newline-after-import': 2,
  'import/no-named-as-default-member': 0,
  'import/no-cycle': 0,
};

const unusedImportsRules = {
  'unused-imports/no-unused-imports': 1,
  'unused-imports/no-unused-vars': [
    0,
    { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
  ],
};

const sortImportsRules = {
  'perfectionist/sort-named-imports': [1, { type: 'line-length', order: 'asc' }],
  'perfectionist/sort-named-exports': [1, { type: 'line-length', order: 'asc' }],
  'perfectionist/sort-exports': [
    1,
    {
      order: 'asc',
      type: 'line-length',
      groupKind: 'values-first',
    },
  ],
  'perfectionist/sort-imports': [
    2,
    {
      order: 'asc',
      ignoreCase: true,
      type: 'line-length',
      environment: 'node',
      newlinesBetween: 'ignore',
      groups: [
        'style',
        'side-effect',
        ['builtin', 'external'],
        'internal',
        ['parent', 'sibling', 'index'],
        'object',
        'unknown',
      ],
    },
  ],
};

export const customConfig = {
  plugins: {
    'react-hooks': reactHooksPlugin,
    'unused-imports': unusedImportsPlugin,
    perfectionist: perfectionistPlugin,
    import: importPlugin,
  },
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.jsx'] },
    },
    react: { version: 'detect' },
  },
  rules: {
    ...commonRules,
    // ...importRules,
    ...unusedImportsRules,
  },
};

export default [
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
  { ignores: ['*', '!src/', '!eslint.config.*'] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  eslintJs.configs.recommended,
  reactPlugin.configs.flat.recommended,
  customConfig,
];
