function needsCustomParser () { // eslint-disable-line no-unused-vars
  var yy = this.yy
  return yy.ignoreComments || yy.allowSingleQuotedStrings ||
    yy.limitedErrorInfo !== true
}

function getOffset (input, line, column) {
  if (line > 1) {
    var breaks = /\r?\n/g
    var match
    while (match = breaks.exec(input)) { // eslint-disable-line no-cond-assign
      if (--line === 1) {
        return match.index + column
      }
    }
  }
  return column - 1
}

function improveCustomError (input, error) {
  var location = error.hash.loc
  var line = location.first_line
  var column = location.first_column
  var offset = getOffset(input, line, column)
  var lines = error.message.split(/\r?\n/)
  error.reason = lines[3]
  error.exzerpt = lines[2]
  error.pointer = lines[1]
  error.location = {
    start: {
      line: line,
      column: column,
      offset: offset
    }
  }
  return error
}

function parseCustom (parse, input) { // eslint-disable-line no-unused-vars
  if (this.yy.limitedErrorInfo) {
    try {
      return parse.call(this, input)
    } catch (error) {
      throw improveCustomError(input, error)
    }
  } else {
    return parse.call(this, input)
  }
}
