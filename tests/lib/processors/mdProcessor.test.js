const outdent = require('outdent')

describe('MD Processor', () => {
  let preprocess, postprocess

  beforeEach(() => {
    jest.resetModules()
    ;({ preprocess, postprocess } = require('../../../lib/processors/mdProcessor'))
  })

  describe('Preprocess', () => {
    it('Do not change documents without codeblocks', () => {
      const document = outdent`
          # Title

          Exmple document

          ## Subtitle

          - foo
          - bar
      `
      const [processedDocument] = preprocess(document, 'example.md')

      expect(processedDocument).toEqual({ filename: '/../../example.md', text: document })
    })

    it('Do not extract indented codeblocks', () => {
      const document = outdent`
          Example:

              console.log("test");

      `
      const [processedDocument] = preprocess(document, 'example.md')

      expect(processedDocument).toEqual({ filename: '/../../example.md', text: document })
    })

    it('Do not extract fenced codeblocks without a language tag', () => {
      const document = outdent`
          Example:

          \`\`\`
          console.log("test");
          \`\`\`

      `
      const [processedDocument] = preprocess(document, 'example.md')

      expect(processedDocument).toEqual({ filename: '/../../example.md', text: document })
    })

    it('Extracts fenced codeblocks', () => {
      const document = outdent`
          Example:

          \`\`\`js
          console.log("test1");
          \`\`\`

          \`\`\`js
          console.log("test2");
          \`\`\`

          \`\`\`js
          console.log("test3");
          \`\`\`

      `
      const [processedDocument, ...codeblocks] = preprocess(document, 'example.md')

      expect(processedDocument).toEqual({
        filename: '/../../example.md',
        text: outdent`
          Example:

          <!--\`\`\`js
          console.log("test1");
          \`\`\`-->

          <!--\`\`\`js
          console.log("test2");
          \`\`\`-->

          <!--\`\`\`js
          console.log("test3");
          \`\`\`-->

      `,
      })

      expect(codeblocks).toEqual([
        {
          text: 'console.log("test1");\n',
          filename: '/../../example.md.js',
        },
        {
          text: 'console.log("test2");\n',
          filename: '/../../example.md.js',
        },
        {
          text: 'console.log("test3");\n',
          filename: '/../../example.md.js',
        },
      ])
    })
  })

  describe('Postprocess', () => {
    it('Do not change errors in the markdown files', () => {
      const document = outdent`
        # Title

        Exmple document

        ## Subtitle

        -  foo
        - bar
      `

      preprocess(document, 'example.md')
      const processedErrors = postprocess([
        [
          {
            ruleId: 'prettier/prettier',
            column: 3,
            endColumn: 4,
            line: 7,
            endLine: 7,
            fix: {
              range: [41, 42],
              text: '',
            },
          },
        ],
      ])

      expect(processedErrors).toEqual([
        {
          ruleId: 'prettier/prettier',
          column: 3,
          endColumn: 4,
          line: 7,
          endLine: 7,
          fix: {
            range: [41, 42],
            text: '',
          },
        },
      ])
    })

    it('Adapt fix ranges after a code block', () => {
      const document = outdent`
        # Title

        \`\`\`js
        console.log(3);
        \`\`\`

        ## Subtitle

        -  foo
        - bar
      `
      preprocess(document, 'example.md')
      const processedErrors = postprocess([
        [
          {
            ruleId: 'prettier/prettier',
            column: 3,
            endColumn: 4,
            line: 9,
            endLine: 9,
            fix: {
              range: [60, 61],
              text: '',
            },
          },
        ],
      ])

      expect(processedErrors).toEqual([
        {
          ruleId: 'prettier/prettier',
          column: 3,
          endColumn: 4,
          line: 9,
          endLine: 9,
          fix: {
            range: [53, 54],
            text: '',
          },
        },
      ])
    })

    it('Adapt error info inside a code block', () => {
      const document = outdent`
        # Title

        \`\`\`js
        console.log(3);
        \`\`\`

        ## Subtitle

        -  foo
        - bar
      `
      preprocess(document, 'example.md')
      const processedErrors = postprocess([
        [], // md errors, empty in this case
        [
          {
            ruleId: 'prettier/prettier',
            column: 1,
            endColumn: 2,
            line: 1,
            endLine: 1,
            fix: {
              range: [0, 1],
              text: '',
            },
          },
        ],
      ])

      expect(processedErrors).toEqual([
        {
          ruleId: 'prettier/prettier',
          column: 1,
          endColumn: 2,
          line: 4,
          endLine: 4,
          fix: {
            range: [15, 16],
            text: '',
          },
        },
      ])
    })

    it('Adapt error info inside an indented code block', () => {
      const document = outdent`
        # Title

        - foo
            \`\`\`js
             console.log(3);
            \`\`\`

      `
      preprocess(document, 'example.md')
      const processedErrors = postprocess([
        [], // md errors, empty in this case
        [
          {
            ruleId: 'prettier/prettier',
            column: 1,
            endColumn: 2,
            line: 1,
            endLine: 1,
            fix: {
              range: [0, 1],
              text: '',
            },
          },
        ],
      ])

      expect(processedErrors).toEqual([
        {
          ruleId: 'prettier/prettier',
          column: 5,
          endColumn: 6,
          line: 5,
          endLine: 5,
          fix: {
            range: [29, 30],
            text: '',
          },
        },
      ])
    })
  })
})
