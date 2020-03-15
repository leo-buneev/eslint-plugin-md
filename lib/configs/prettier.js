module.exports = {
  plugins: ['md'],
  rules: {
    'md/remark': [
      'error',
      { plugins: ['preset-lint-markdown-style-guide', 'frontmatter', ['lint-maximum-line-length', false]] },
    ],
  },
  overrides: [
    {
      files: ['*.md'],
      parser: 'markdown-eslint-parser',
      rules: {
        'prettier/prettier': [
          'warn',
          {
            parser: 'markdown',
          },
        ],
      },
    },
  ],
}
