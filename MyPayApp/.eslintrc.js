module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.config.js', '.eslintrc.js', 'babel.config.js', 'jest.setup.js', 'metro.config.js'],
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
    {
      files: ['index.js'],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'module',
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
