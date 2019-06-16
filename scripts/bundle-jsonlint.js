var fs = require('fs')
var path = require('path')
var prefix = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('jsonlint', ['exports'], factory) :
  (global = global || self, factory(global.jsonlint = {}))
}(this, function (exports) { 'use strict'

`
var suffix = `
  exports.parser = jsonlint
  exports.Parser = jsonlint.Parser
  exports.parse = function (input, options) {
    return jsonlint.parse(input, options, false)
  }
  exports.parseNative = parseNative
  exports.parseCustom = parseCustom
  exports.tokenize = tokenize
  exports.getErrorTexts = getTexts
  exports.pathToPointer = pathToPointer
  exports.pointerToPath = pointerToPath
  Object.defineProperty(exports, '__esModule', { value: true })
}));
`
var unicodeFile = path.join(__dirname, '../src/unicode.js')
var unicodeSource = fs.readFileSync(unicodeFile, 'utf8')
var customFile = path.join(__dirname, '../src/custom-parser.js')
var customSource = fs.readFileSync(customFile, 'utf8')
var nativeFile = path.join(__dirname, '../src/native-parser.js')
var nativeSource = fs.readFileSync(nativeFile, 'utf8')
var configurableFile = path.join(__dirname, '../src/configurable-parser.js')
var configurableSource = fs.readFileSync(configurableFile, 'utf8')
var jsonlintFile = path.join(__dirname, '../lib/jsonlint.js')
var jsonlintSource = prefix + unicodeSource + '\n' + customSource + '\n' +
  nativeSource + '\n' + configurableSource + suffix
fs.writeFileSync(jsonlintFile, jsonlintSource)
