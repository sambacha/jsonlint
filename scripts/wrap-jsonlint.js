var fs = require('fs')
var path = require('path')
var prefix = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('jsonlint', ['exports'], factory) :
  (global = global || self, factory(global.jsonlint = {}));
}(this, function (exports) { 'use strict';

`
var suffix = `
  exports.parser = jsonlint;
  exports.Parser = jsonlint.Parser;
  exports.parse = jsonlint.parse.bind(jsonlint)

  Object.defineProperty(exports, '__esModule', { value: true });
}));
`
var scriptFile = path.join(__dirname, '../lib/jsonlint.js')
var scriptSource = fs.readFileSync(scriptFile, 'utf8')
var nativeFile = path.join(__dirname, '../src/native-parser.js')
var nativeSource = fs.readFileSync(nativeFile, 'utf8')
var customFile = path.join(__dirname, '../src/custom-parser.js')
var customSource = fs.readFileSync(customFile, 'utf8')
var wrapperFile = path.join(__dirname, '../src/configurable-parser.js')
var wrapperSource = fs.readFileSync(wrapperFile, 'utf8')
scriptSource = prefix + scriptSource + '\n\n' + nativeSource +
  '\n' + customSource + '\n' + wrapperSource + suffix
fs.writeFileSync(scriptFile, scriptSource)
