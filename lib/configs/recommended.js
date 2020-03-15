module.exports = {
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
}
