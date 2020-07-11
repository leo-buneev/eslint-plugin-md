const path = require('path')

let mdOffsets = []
let nonMdBlocks = []

module.exports = {
  preprocess(text, filename) {
    let offset = 0
    const mdOffsetsInner = []
    const nonMdBlocksInner = []
    // const ignoreMdRangesInner = []
    const mdWithoutJs = text.replace(/```(\w+)\n([\s\S]*?)\n```\n/gim, (substr, lang, match, position) => {
      const replacement = '<!-- comment -->\n'.repeat(match.split('\n').length + 2)
      const oldOffset = offset
      offset += substr.length - replacement.length
      // ignoreMdRangesInner.push({ start: position, end: position + replacement.length })
      mdOffsetsInner.push({ startFrom: position - oldOffset, offset })
      nonMdBlocksInner.push({
        lang,
        text: match + '\n',
        charOffset: position + ('```' + lang + '\n').length,
        lineOffset: text.slice(0, position).split('\n').length,
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
    // console.log('JSBR', jsBlocksResult)
    return [mdWithoutJs, ...jsBlocksResult]
  },

  postprocess(messageGroups, x) {
    const result = []
    // console.log('MG', messageGroups)
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
        const { lineOffset, charOffset } = nonMdBlocks[i - 1]
        for (const m of mg) {
          if (m.fix && m.fix.range) {
            m.fix.range = m.fix.range.map(pos => pos + charOffset)
          }
          m.line += lineOffset
          m.endLine = m.endLine && m.endLine + lineOffset
        }
      }
      result.push(...mg)
    }
    return result
  },

  supportsAutofix: true,
}
