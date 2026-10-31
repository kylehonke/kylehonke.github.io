import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
    { ignores: ['dist'] },
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx}'],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        ...reactHooks.configs.flat['recommended-latest'],
    },
    {
        files: ['src/**/*.{js,jsx}'],
        ...reactRefresh.configs.vite,
    },
    {
        files: ['scripts/**/*.js', '*.config.js'],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: { globals: { ...globals.node, ...globals.browser } },
    },
    {
        linterOptions: { reportUnusedDisableDirectives: 'error' },
    },
];

