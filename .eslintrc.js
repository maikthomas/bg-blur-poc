module.exports = {
  rules: {},
  env: {
    es6: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  overrides: [
    {
      files: ['**/webpack.config.js', '**/prettierrc.js'],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        node: true,
      },
    },
  ],
};
