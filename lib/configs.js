// We provide section "overrides" here - and if user's eslintrc doesn't specify "parser" at all, it will work.
// However, usually users specify some kind of "parser". In this case, it will take precedense over our "overrides",
// and end user will need to specify similar "overrides" explicitly in his eslintrc file.

module.exports = {
  prettier: {
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
  },
  recommended: {
    plugins: ['md'],
    rules: {
      'md/remark': ['error', { plugins: ['preset-lint-markdown-style-guide', 'frontmatter'] }],
    },
    overrides: [
      {
        files: ['*.md'],
        parser: 'markdown-eslint-parser',
      },
    ],
  },
}
