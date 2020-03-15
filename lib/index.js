/**
 * @fileoverview An ESLint plugin to lint and fix markdown files.
 * @author Leonid Buneev
 */
const path = require('path')
const requireIndex = require('requireindex')
const mdProcessor = require('./processors/mdProcessor')

module.exports.rules = requireIndex(path.join(__dirname, '/rules'))
module.exports.configs = requireIndex(path.join(__dirname, '/configs'))
module.exports.processors = { '.md': mdProcessor }
