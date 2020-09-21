const path = require('path')

let mdOffsets = []
let nonMdBlocks = []

module.exports = {
  preprocess(text, filename) {
    let offset = 0
    const mdOffsetsInner = []
    const nonMdBlocksInner = []

    // Find fenced code blocks tagged with a language, optionall indented
    const mdWithoutJs = text.replace(/([\t ]*)```(\w+)\n([\s\S]*?)```/gim, (substr, indent, lang, match, position) => {
      // Quote the code block without adding extra lines
      const replacement = indent + '<!--' + substr + '-->'
      const oldOffset = offset
      offset += substr.length - replacement.length
      mdOffsetsInner.push({ startFrom: position - oldOffset, offset })
      nonMdBlocksInner.push({
        lang,
        text: match.replace(new RegExp('^' + indent, 'gim'), ''),
        charOffset: position + ('```' + lang + '\n').length,
        lineOffset: text.slice(0, position).split('\n').length,
        indentOffset: indent.length,
      })
      return replacement
    })
    mdOffsets = mdOffsetsInner.reverse()
    nonMdBlocks = nonMdBlocksInner

    const partName = (filename && path.basename(filename)) || 'file.md'

    const jsBlocksResult = nonMdBlocksInner.map(({ text, lang }, i) => ({
      text,
      // eslint internal code appends this filename to real filename
      filename: `/../../${partName}.${lang}`,
    }))
    return [
      {
        text: mdWithoutJs,
        filename: `/../../${filename}`,
      },
      ...jsBlocksResult,
    ]
  },

  postprocess(messageGroups, x) {
    const result = []
    for (let i = 0; i < messageGroups.length; i++) {
      const mg = messageGroups[i]
      if (i === 0) {
        for (const m of mg) {
          if (m.fix && m.fix.range) {
            m.fix.range = m.fix.range.map(pos => {
              const mdOffset = mdOffsets.find(o => o.startFrom < pos)
              if (!mdOffset) return pos
              return pos + mdOffset.offset
            })
          }
        }
      } else {
        // Javascript
        const { lineOffset, charOffset, indentOffset } = nonMdBlocks[i - 1]
        for (const m of mg) {
          if (m.fix && m.fix.range) {
            m.fix.range = m.fix.range.map(pos => pos + charOffset + indentOffset * (m.line + 1))
          }
          m.line += lineOffset
          m.endLine = m.endLine && m.endLine + lineOffset
          m.column = m.column + indentOffset
          m.endColumn = m.endColumn + indentOffset
        }
      }
      result.push(...mg)
    }
    return result
  },

  supportsAutofix: true,
}
