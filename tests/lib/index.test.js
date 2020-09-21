const Linter = require('eslint').Linter
const parser = require('markdown-eslint-parser')
const outdent = require('outdent')
const { preprocess, postprocess } = require('../../lib/index').processors['.md']
const config = require('../../lib/configs')

const linter = new Linter()
linter.defineParser('markdown-eslint-parser', parser)
// Can't use `plugin.rules` because it uses `requireIndex` which doesn't work in Jest
linter.defineRule('md/remark', require('../../lib/rules/remark'))
linter.defineRule('prettier/prettier', require('eslint-plugin-prettier').rules.prettier)

const lintMd = document =>
  linter.verify(
    document,
    {
      parser: 'markdown-eslint-parser',
      rules: {
        ...config.prettier.rules,
        'prettier/prettier': [
          'error',
          {
            parser: 'markdown',
          },
        ],
      },
    },
    { filename: 'README.md', preprocess, postprocess, filterCodeBlock: name => name.split('.').pop() === 'md' },
  )

const lintJs = document =>
  linter.verify(
    document,
    {
      rules: {
        ...config.prettier.rules,
        'prettier/prettier': ['error'],
      },
    },
    { filename: 'README.md', preprocess, postprocess, filterCodeBlock: name => name.split('.').pop() === 'js' },
  )

describe('Plugin', () => {
  describe('Markdown blocks', () => {
    it('No errors', async () => {
      const document = outdent`
          # Title

          Exmple document

          ## Subtitle

          - foo
          - bar

      `

      const errors = await lintMd(document)

      expect(errors).toHaveLength(0)
    })

    it('Detects remark errors in markdown', async () => {
      const document = outdent`
        # Title

        ### Subtitle

        - foo
        - bar

      `

      const errors = await lintMd(document)

      expect(errors).toEqual([
        expect.objectContaining({
          column: 1,
          endColumn: 13,
          endLine: 3,
          line: 3,
          message: 'Heading levels should increment by one level at a time (heading-increment)',
          ruleId: 'md/remark',
        }),
      ])
    })

    it('Detects prettier errors in markdown', async () => {
      const document = outdent`
        # Title

        ## Subtitle

        -  foo
        - bar

      `

      const errors = await lintMd(document)

      expect(errors).toEqual([
        expect.objectContaining({
          column: 3,
          endColumn: 4,
          line: 5,
          endLine: 5,
          fix: { range: [24, 25], text: '' },
          message: 'Delete `·`',
          ruleId: 'prettier/prettier',
        }),
      ])
    })
  })

  describe('JS blocks', () => {
    it('No errors', async () => {
      const document = outdent`
        # Title

        \`\`\`js
        console.log("test");
        \`\`\`

        ## Subtitle

        - foo
          \`\`\`js
          console.log("foo");
          \`\`\`

        - bar
      `

      const errors = await lintJs(document)

      expect(errors).toHaveLength(0)
    })

    it('Detects prettier errors in code blocks', async () => {
      const document = outdent`
        # Title

        \`\`\`js
         console.log("test")
        \`\`\`

        ## Subtitle

        - foo

          \`\`\`js
           console.log("test")
          \`\`\`

        - bar
      `

      const errors = await lintJs(document)

      expect(errors).toEqual([
        expect.objectContaining({
          column: 1,
          endColumn: 21,
          line: 4,
          endLine: 4,
          fix: { range: [15, 35], text: 'console.log("test");' },
          message: 'Replace `·console.log("test")` with `console.log("test");`',
          ruleId: 'prettier/prettier',
        }),
        expect.objectContaining({
          column: 3,
          endColumn: 23,
          line: 12,
          endLine: 12,
          fix: { range: [71, 91], text: 'console.log("test");' },
          message: 'Replace `·console.log("test")` with `console.log("test");`',
          ruleId: 'prettier/prettier',
        }),
      ])
    })
  })
})
