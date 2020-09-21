module.exports = {
  root: true,
  env: { node: true },
  extends: ['plugin:tyrecheck/recommended'],
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': [process.env.NODE_ENV === 'production' ? 'error' : 'off', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        node: true,
        jest: true,
      },
    },
  ],
}
