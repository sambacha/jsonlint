function getLineAndColumn (input, offset) {
  var lines = input
    .substr(0, offset)
    .split(/\r?\n/)
  var line = lines.length
  var column = lines[line - 1].length + 1
  return {
    line: line,
    column: column
  }
}

function pastInput (input, offset) {
  var start = Math.max(0, offset - 20)
  var previous = input.substr(start, offset - start)
  return (offset > 20 ? '...' : '') + previous.replace(/\n/g, '')
}

function upcomingInput (input, offset) {
  var start = Math.max(0, offset - 20)
  start += offset - start
  var rest = input.length - start
  var next = input.substr(start, Math.min(20, rest))
  return next.replace(/\n/g, '') + (rest > 20 ? '...' : '')
}

function getPositionContext (input, offset) {
  var past = pastInput(input, offset)
  var upcoming = upcomingInput(input, offset)
  var pointer = new Array(past.length + 1).join('-') + '^'
  return {
    exzerpt: past + upcoming,
    pointer: pointer
  }
}

function improveNativeError (input, error) {
  var message = error.message
  var match = / in JSON at position (\d+)$/.exec(message)
  var offset
  if (match) {
    offset = +match[1]
    message = message.substr(0, match.index)
  } else {
    offset = input.length
  }
  var location = getLineAndColumn(input, offset)
  var line = location.line
  var column = location.column
  location = 'line ' + line + ', column ' + column
  var position = getPositionContext(input, offset)
  var exzerpt = position.exzerpt
  var pointer = position.pointer
  error.message = 'Parse error on ' + location + ':\n' +
    exzerpt + '\n' + pointer + '\n' + message
  error.reason = message
  error.exzerpt = exzerpt
  error.pointer = pointer
  error.location = {
    start: {
      column: column,
      line: line,
      offset: offset
    }
  }
  return error
}

function parseNatively (input) { // eslint-disable-line no-unused-vars
  try {
    return JSON.parse(input)
  } catch (error) {
    throw improveNativeError(input, error)
  }
}
