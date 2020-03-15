/**
 * @fileoverview Lint markdown (*.md) files using package "remark"
 * @author Leonid Buneev
 */
const _ = require('lodash')
const remark = require('remark')
const fs = require('fs')
// const { showInvisibles, generateDifferences } = require('prettier-linter-helpers')

// const { INSERT, DELETE, REPLACE } = generateDifferences

// function reportInsert(context, offset, text) {
//   const pos = context.getSourceCode().getLocFromIndex(offset)
//   const range = [offset, offset]
//   context.report({
//     message: 'Insert `{{ code }}`',
//     data: { code: showInvisibles(text) },
//     loc: { start: pos, end: pos },
//     fix(fixer) {
//       return fixer.insertTextAfterRange(range, text)
//     },
//   })
// }

// function reportDelete(context, offset, text) {
//   const start = context.getSourceCode().getLocFromIndex(offset)
//   const end = context.getSourceCode().getLocFromIndex(offset + text.length)
//   const range = [offset, offset + text.length]
//   context.report({
//     message: 'Delete `{{ code }}`',
//     data: { code: showInvisibles(text) },
//     loc: { start, end },
//     fix(fixer) {
//       return fixer.removeRange(range)
//     },
//   })
// }

// function reportReplace(context, offset, deleteText, insertText) {
//   const start = context.getSourceCode().getLocFromIndex(offset)
//   const end = context.getSourceCode().getLocFromIndex(offset + deleteText.length)
//   const range = [offset, offset + deleteText.length]
//   context.report({
//     message: 'Replace `{{ deleteCode }}` with `{{ insertCode }}`',
//     data: {
//       deleteCode: showInvisibles(deleteText),
//       insertCode: showInvisibles(insertText),
//     },
//     loc: { start, end },
//     fix(fixer) {
//       return fixer.replaceTextRange(range, insertText)
//     },
//   })
// }

module.exports = {
  meta: {
    docs: {
      description: 'Lint markdown (*.md) files using package "remark"',
    },
    fixable: 'code', // or "code" or "whitespace"
    schema: [
      // Remark options:
      {
        type: 'object',
        properties: {},
        additionalProperties: true,
      },
      {
        type: 'object',
        properties: {
          useRemarkrc: { type: 'boolean' },
        },
        additionalProperties: true,
      },
    ],
  },

  create: function(context) {
    return {
      Program(node) {
        if (!node.mdCode) return // Not processed by markdown-eslint-parser => not .md
        const useRemarkrc = !context.options[1] || context.options[1].useRemarkrc !== false
        let remarkOptionsFromFile = null

        if (useRemarkrc) {
          if (fs.existsSync('./.remarkrc')) {
            remarkOptionsFromFile = JSON.parse(fs.readFileSync('./.remarkrc', 'utf8'))
          } else if (fs.existsSync('./.remarkrc.js')) {
            remarkOptionsFromFile = require('./.remarkrc.js')
          }
        }
        const remarkOptions = _.merge({ plugins: [] }, remarkOptionsFromFile, context.options[0])

        // const sourceCode = context.getSourceCode()
        // const filepath = context.getFilename()
        // const source = sourceCode.text
        const source = node.mdCode

        let remarkProcessor = remark()
        for (let plugin of remarkOptions.plugins) {
          if (!_.isArray(plugin)) plugin = [plugin]
          if (!plugin[0].startsWith('remark-')) plugin[0] = 'remark-' + plugin[0]
          plugin[0] = require(plugin[0])
          remarkProcessor = remarkProcessor.use(...plugin)
        }
        // const vfile = remark()
        // .use({
        //   settings: { emphasis: '*', strong: '*' },
        // })
        const vfile = remarkProcessor.processSync(source)
        const messages = vfile.messages || []

        // const fixedSource = String(vfile)

        for (const msg of messages) {
          msg.location.start.column -= 1
          msg.location.end.column -= 1
          context.report({
            message: msg.message + ` (${msg.ruleId})`,
            loc: msg.location,
          })
        }
        // if (source !== fixedSource) {
        //   const differences = generateDifferences(source, fixedSource)
        //   for (const difference of differences) {
        //     switch (difference.operation) {
        //       case INSERT:
        //         reportInsert(context, difference.offset, difference.insertText)
        //         break
        //       case DELETE:
        //         reportDelete(context, difference.offset, difference.deleteText)
        //         break
        //       case REPLACE:
        //         reportReplace(context, difference.offset, difference.deleteText, difference.insertText)
        //         break
        //     }
        //   }
        // }
      },
    }
  },
}
