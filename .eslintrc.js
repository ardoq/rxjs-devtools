module.exports = {
  extends: ['./node_modules/@ardoq/shared-configs/eslint-app'],
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    node: true,
    webextensions: true,
  },
  rules: {
    'no-console': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
  },
};
