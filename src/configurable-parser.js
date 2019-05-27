/* globals jsonlint */

var Parser = jsonlint.Parser

function ConfigurableParser (options) {
  Parser.prototype.constructor.call(this)
  processOptions.call(this, options)
}

function parse (input, options) {
  processOptions.call(this, options)
  return Parser.prototype.parse.call(this, input)
}

function processOptions (options) {
  if (options) {
    if (options.ignoreComments) {
      this.yy.ignoreComments = true
    }
    if (options.allowSingleQuotedStrings) {
      this.yy.allowSingleQuotedStrings = true
    }
  }
}

ConfigurableParser.prototype = Object.create(Parser.prototype)
ConfigurableParser.prototype.constructor = ConfigurableParser
ConfigurableParser.prototype.parse = parse
ConfigurableParser.prototype.Parser = ConfigurableParser

jsonlint = new ConfigurableParser() // eslint-disable-line no-global-assign
