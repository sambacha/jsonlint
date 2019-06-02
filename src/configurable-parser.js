/* globals navigator, process, parseCustom, parseNative */

function Parser (options, deprecate) {
  if (deprecate !== false) {
    console.warn('DEPRECATED: Do not instantiate an object of the class Parser. Call the method `parse` directly exported from the main module (`lib/jsonlint`).')
  }
  processOptions.call(this, options)
}

function processOptions (options) {
  if (options) {
    var changed = {}
    if (options.ignoreComments !== undefined) {
      changed.ignoreComments = this.ignoreComments
      this.ignoreComments = options.ignoreComments
    }
    if (options.allowSingleQuotedStrings !== undefined) {
      changed.allowSingleQuotedStrings = this.allowSingleQuotedStrings
      this.allowSingleQuotedStrings = options.allowSingleQuotedStrings
    }
    if (options.mode !== undefined) {
      changed.mode = this.mode
      this.mode = options.mode
    }
    return changed
  }
}

function restoreContext (changed) {
  if (changed) {
    for (var option in changed) {
      var value = changed[option]
      if (value === undefined) {
        delete this[option]
      } else {
        this[option] = value
      }
    }
  }
}

function needsCustomParser () {
  return this.ignoreComments || this.allowSingleQuotedStrings ||
    this.mode === 'cjson' || this.mode === 'json5'
}

function getReviver (options) {
  if (typeof options === 'function') {
    return options
  } else if (options) {
    return options.reviver
  }
}

Parser.prototype.constructor = Parser
Parser.prototype.Parser = Parser

Parser.prototype.parse = function (input, options, deprecate) {
  if (deprecate !== false) {
    console.warn('DEPRECATED: Do not call the instance method `parse`. method  Call the `parse` directly exported from the main module (`lib/jsonlint`).')
  }
  var changed = processOptions.call(this, options)
  try {
    return needsCustomParser.call(this)
      ? parseCustom.call(this, input, options)
      : parseNative(input, getReviver(options))
  } finally {
    restoreContext.call(this, changed)
  }
}

var jsonlint = new Parser(undefined, false) // eslint-disable-line no-unused-vars
