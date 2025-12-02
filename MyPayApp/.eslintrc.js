module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.config.js', '.eslintrc.js', 'babel.config.js'],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2020,
        requireConfigFile: false,
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
