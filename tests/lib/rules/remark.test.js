/**
 * @fileoverview Template literals (strings created with `backquote symbol`) should use loc`mystring` syntax for localization
 * @author Leonid Buneev
 */
'use strict'

// Requirements
const rule = require('../../../lib/rules/remark')
const RuleTester = require('eslint').RuleTester

// Tests
const ruleTester = new RuleTester({
  parser: require.resolve('markdown-eslint-parser'),
})
ruleTester.run('remark', rule, {
  valid: [
    {
      options: [{ plugins: ['preset-lint-markdown-style-guide', ['lint-maximum-line-length', false]] }],
      code: `Line more than 80 symbols long. Line more than 80 symbols long. Line more than 80 symbols long.\n`,
    },
    {
      options: [{ plugins: ['preset-lint-markdown-style-guide'] }],
      code: `*Hello world*\n`,
    },
    {
      options: [{ plugins: ['preset-lint-markdown-style-guide'] }],
      code: `::: tip\nThis is a tip\n:::\n`,
    },
    {
      options: [{ plugins: ['preset-lint-markdown-style-guide'] }],
      code: `| Tables        | Are           | Cool  |\n
| ------------- |:-------------:| -----:|\n
| col 3 is      | right-aligned | $1600 |\n`,
    },
    {
      options: [{ plugins: ['preset-lint-markdown-style-guide', 'frontmatter'] }],
      code: `---\nhome: true\n---\n`,
    },
    // Not supported
    // {
    //   code: `[[toc]]\n`,
    // },
  ],

  invalid: [
    {
      options: [{ plugins: ['preset-lint-markdown-style-guide'] }],
      code: `_Hello world_\n`,
      errors: [
        {
          message: 'Emphasis should use `*` as a marker (emphasis-marker)',
        },
      ],
    },
  ],
})
