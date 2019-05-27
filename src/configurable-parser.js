/* globals jsonlint */

var Parser = jsonlint.Parser

function ConfigurableParser (options) {
  Parser.prototype.constructor.call(this)
  processOptions.call(this, options)
}

function parse (input, options) {
  var changed = processOptions.call(this, options)
  try {
    return Parser.prototype.parse.call(this, input)
  } finally {
    restoreContext.call(this, changed)
  }
}

function processOptions (options) {
  if (options) {
    var changed = {}
    if (options.ignoreComments !== undefined) {
      changed.ignoreComments = this.yy.ignoreComments
      this.yy.ignoreComments = !!options.ignoreComments
    }
    if (options.allowSingleQuotedStrings !== undefined) {
      changed.allowSingleQuotedStrings = this.yy.allowSingleQuotedStrings
      this.yy.allowSingleQuotedStrings = !!options.allowSingleQuotedStrings
    }
    return changed
  }
}

function restoreContext (changed) {
  if (changed) {
    var yy = this.yy
    for (var option in changed) {
      var value = changed[option]
      if (value === undefined) {
        delete yy[option]
      } else {
        yy[option] = value
      }
    }
  }
}

ConfigurableParser.prototype = Object.create(Parser.prototype)
ConfigurableParser.prototype.constructor = ConfigurableParser
ConfigurableParser.prototype.parse = parse
ConfigurableParser.prototype.Parser = ConfigurableParser

jsonlint = new ConfigurableParser() // eslint-disable-line no-global-assign
