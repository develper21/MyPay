module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.config.js', '.eslintrc.js'],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2020,
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
