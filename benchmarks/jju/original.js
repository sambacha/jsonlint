// Modified from https://github.com/rlidwka/jju/blob/master/lib/parse.js

var Uni = require('./unicode')

function isHexDigit (x) {
  return (x >= '0' && x <= '9') ||
      (x >= 'A' && x <= 'F') ||
      (x >= 'a' && x <= 'f')
}

function isOctDigit (x) {
  return x >= '0' && x <= '7'
}

function isDecDigit (x) {
  return x >= '0' && x <= '9'
}

var unescapeMap = {
  '\'': '\'',
  '"': '"',
  '\\': '\\',
  'b': '\b',
  'f': '\f',
  'n': '\n',
  'r': '\r',
  't': '\t',
  'v': '\v',
  '/': '/'
}

function formatError (input, message, position, lineNumber, column, json5) {
  var result = message + ' at ' + (lineNumber + 1) + ':' + (column + 1)

  var startPosition = position - column - 1

  var sourceLine = ''

  var underline = ''

  var isLineTerminator = json5 ? Uni.isLineTerminator : Uni.isLineTerminatorJSON

  // output no more than 70 characters before the wrong ones
  if (startPosition < position - 70) {
    startPosition = position - 70
  }

  while (1) {
    var chr = input[++startPosition]

    if (isLineTerminator(chr) || startPosition === input.length) {
      if (position >= startPosition) {
        // ending line error, so show it after the last char
        underline += '^'
      }
      break
    }
    sourceLine += chr

    if (position === startPosition) {
      underline += '^'
    } else if (position > startPosition) {
      underline += input[startPosition] === '\t' ? '\t' : ' '
    }

    // output no more than 78 characters on the string
    if (sourceLine.length > 78) break
  }

  return result + '\n' + sourceLine + '\n' + underline
}

function parse (input, options) {
  // parse as a standard JSON mode
  var json5 = false
  var cjson = false

  if (options.legacy || options.mode === 'json') {
    // use json
  } else if (options.mode === 'cjson') {
    cjson = true
  } else if (options.mode === 'json5') {
    json5 = true
  } else {
    // use it by default
    json5 = true
  }

  var isLineTerminator = json5 ? Uni.isLineTerminator : Uni.isLineTerminatorJSON
  var isWhiteSpace = json5 ? Uni.isWhiteSpace : Uni.isWhiteSpaceJSON

  var length = input.length

  var lineNumber = 0
  var lineStart = 0
  var position = 0

  var stack = []

  var tokenStart = function () {}
  var tokenEnd = function (v) { return v }

  /* tokenize({
       raw: '...',
       type: 'whitespace'|'comment'|'key'|'literal'|'separator'|'newline',
       value: 'number'|'string'|'whatever',
       path: [...],
     })
  */
  if (options._tokenize) {
    ;(function () {
      var start = null
      tokenStart = function () {
        if (start !== null) throw Error('internal error, token overlap')
        start = position
      }

      tokenEnd = function (v, type) {
        if (start !== position) {
          var hash = {
            raw: input.substr(start, position - start),
            type: type,
            stack: stack.slice(0)
          }
          if (v !== undefined) hash.value = v
          options._tokenize.call(null, hash)
        }
        start = null
        return v
      }
    })()
  }

  function fail (message) {
    var column = position - lineStart

    if (!message) {
      if (position < length) {
        var token = '\'' +
          JSON
            .stringify(input[position])
            .replace(/^"|"$/g, '')
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"') +
          '\''

        if (!message) message = 'Unexpected token ' + token
      } else {
        if (!message) message = 'Unexpected end of input'
      }
    }

    var error = SyntaxError(formatError(input, message, position, lineNumber, column, json5))
    error.row = lineNumber + 1
    error.column = column + 1
    throw error
  }

  function newLine (chr) {
    // account for <cr><lf>
    if (chr === '\r' && input[position] === '\n') position++
    lineStart = position
    lineNumber++
  }

  function parseGeneric () {
    while (position < length) {
      tokenStart()
      var chr = input[position++]

      if (chr === '"' || (chr === '\'' && json5)) {
        return tokenEnd(parseString(chr), 'literal')
      } else if (chr === '{') {
        tokenEnd(undefined, 'separator')
        return parseObject()
      } else if (chr === '[') {
        tokenEnd(undefined, 'separator')
        return parseArray()
      } else if (chr === '-' ||
             chr === '.' ||
             isDecDigit(chr) ||
      //           + number       Infinity          NaN
             (json5 && (chr === '+' || chr === 'I' || chr === 'N'))
      ) {
        return tokenEnd(parseNumber(), 'literal')
      } else if (chr === 'n') {
        parseKeyword('null')
        return tokenEnd(null, 'literal')
      } else if (chr === 't') {
        parseKeyword('true')
        return tokenEnd(true, 'literal')
      } else if (chr === 'f') {
        parseKeyword('false')
        return tokenEnd(false, 'literal')
      } else {
        position--
        return tokenEnd(undefined)
      }
    }
  }

  function parseKey () {
    var result

    while (position < length) {
      tokenStart()
      var chr = input[position++]

      if (chr === '"' || (chr === '\'' && json5)) {
        return tokenEnd(parseString(chr), 'key')
      } else if (chr === '{') {
        tokenEnd(undefined, 'separator')
        return parseObject()
      } else if (chr === '[') {
        tokenEnd(undefined, 'separator')
        return parseArray()
      } else if (chr === '.' || isDecDigit(chr)
      ) {
        return tokenEnd(parseNumber(true), 'key')
      } else if ((json5 && Uni.isIdentifierStart(chr)) ||
                 (chr === '\\' && input[position] === 'u')) {
        // unicode char or a unicode sequence
        var rollback = position - 1
        result = parseIdentifier()

        if (result === undefined) {
          position = rollback
          return tokenEnd(undefined)
        } else {
          return tokenEnd(result, 'key')
        }
      } else {
        position--
        return tokenEnd(undefined)
      }
    }
  }

  function skipWhiteSpace () {
    tokenStart()
    while (position < length) {
      var chr = input[position++]

      if (isLineTerminator(chr)) {
        position--
        tokenEnd(undefined, 'whitespace')
        tokenStart()
        position++
        newLine(chr)
        tokenEnd(undefined, 'newline')
        tokenStart()
      } else if (isWhiteSpace(chr)) {
        // nothing

      } else if (chr === '/' &&
             (json5 || cjson) &&
             (input[position] === '/' || input[position] === '*')
      ) {
        position--
        tokenEnd(undefined, 'whitespace')
        tokenStart()
        position++
        skipComment(input[position++] === '*')
        tokenEnd(undefined, 'comment')
        tokenStart()
      } else {
        position--
        break
      }
    }
    return tokenEnd(undefined, 'whitespace')
  }

  function skipComment (multi) {
    while (position < length) {
      var chr = input[position++]

      if (isLineTerminator(chr)) {
        // LineTerminator is an end of singleline comment
        if (!multi) {
          // let parent function deal with newline
          position--
          return
        }

        newLine(chr)
      } else if (chr === '*' && multi) {
        // end of multiline comment
        if (input[position] === '/') {
          position++
          return
        }
      } else {
        // nothing
      }
    }

    if (multi) {
      fail('Unclosed multiline comment')
    }
  }

  function parseKeyword (keyword) {
    // keyword[0] is not checked because it should've checked earlier
    var startPosition = position
    var len = keyword.length
    for (var i = 1; i < len; i++) {
      if (position >= length || keyword[i] !== input[position]) {
        position = startPosition - 1
        fail()
      }
      position++
    }
  }

  function parseObject () {
    var result = options.null_prototype ? Object.create(null) : {}
    var emptyObject = {}
    var isNotEmpty = false

    while (position < length) {
      skipWhiteSpace()
      var key = parseKey()
      skipWhiteSpace()
      tokenStart()
      var chr = input[position++]
      tokenEnd(undefined, 'separator')

      if (chr === '}' && key === undefined) {
        if (!json5 && isNotEmpty) {
          position--
          fail('Trailing comma in object')
        }
        return result
      } else if (chr === ':' && key !== undefined) {
        skipWhiteSpace()
        stack.push(key)
        var value = parseGeneric()
        stack.pop()

        if (value === undefined) fail('No value found for key ' + key)
        if (typeof (key) !== 'string') {
          if (!json5 || typeof (key) !== 'number') {
            fail('Wrong key type: ' + key)
          }
        }

        if ((key in emptyObject || emptyObject[key] != null) && options.reserved_keys !== 'replace') {
          if (options.reserved_keys === 'throw') {
            fail('Reserved key: ' + key)
          } else {
            // silently ignore it
          }
        } else {
          if (typeof (options.reviver) === 'function') {
            value = options.reviver.call(null, key, value)
          }

          if (value !== undefined) {
            isNotEmpty = true
            Object.defineProperty(result, key, {
              value: value,
              enumerable: true,
              configurable: true,
              writable: true
            })
          }
        }

        skipWhiteSpace()

        tokenStart()
        chr = input[position++]
        tokenEnd(undefined, 'separator')

        if (chr === ',') {
          continue
        } else if (chr === '}') {
          return result
        } else {
          fail()
        }
      } else {
        position--
        fail()
      }
    }

    fail()
  }

  function parseArray () {
    var result = []

    while (position < length) {
      skipWhiteSpace()
      stack.push(result.length)
      var item = parseGeneric()
      stack.pop()
      skipWhiteSpace()
      tokenStart()
      var chr = input[position++]
      tokenEnd(undefined, 'separator')

      if (item !== undefined) {
        if (typeof (options.reviver) === 'function') {
          item = options.reviver.call(null, String(result.length), item)
        }
        if (item === undefined) {
          result.length++
          item = true // hack for check below, not included into result
        } else {
          result.push(item)
        }
      }

      if (chr === ',') {
        if (item === undefined) {
          fail('Elisions are not supported')
        }
      } else if (chr === ']') {
        if (!json5 && item === undefined && result.length) {
          position--
          fail('Trailing comma in array')
        }
        return result
      } else {
        position--
        fail()
      }
    }
  }

  function parseNumber () {
    // rewind because we don't know first char
    position--

    var start = position

    var chr = input[position++]

    var toNumber = function (isOctal) {
      var str = input.substr(start, position - start)
      var result

      if (isOctal) {
        result = parseInt(str.replace(/^0o?/, ''), 8)
      } else {
        result = Number(str)
      }

      if (Number.isNaN(result)) {
        position--
        fail('Bad numeric literal - "' + input.substr(start, position - start + 1) + '"')
      } else if (!json5 && !str.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?(e[+-]?[0-9]+)?$/i)) {
        // additional restrictions imposed by json
        position--
        fail('Non-json numeric literal - "' + input.substr(start, position - start + 1) + '"')
      } else {
        return result
      }
    }

    // ex: -5982475.249875e+29384
    //     ^ skipping this
    if (chr === '-' || (chr === '+' && json5)) chr = input[position++]

    if (chr === 'N' && json5) {
      parseKeyword('NaN')
      return NaN
    }

    if (chr === 'I' && json5) {
      parseKeyword('Infinity')

      // returning +inf or -inf
      return toNumber()
    }

    if (chr >= '1' && chr <= '9') {
      // ex: -5982475.249875e+29384
      //        ^^^ skipping these
      while (position < length && isDecDigit(input[position])) position++
      chr = input[position++]
    }

    // special case for leading zero: 0.123456
    if (chr === '0') {
      chr = input[position++]

      //             new syntax, "0o777"           old syntax, "0777"
      var isOctal = chr === 'o' || chr === 'O' || isOctDigit(chr)
      var isHex = chr === 'x' || chr === 'X'

      if (json5 && (isOctal || isHex)) {
        while (position < length &&
           (isHex ? isHexDigit : isOctDigit)(input[position])
        ) position++

        var sign = 1
        if (input[start] === '-') {
          sign = -1
          start++
        } else if (input[start] === '+') {
          start++
        }

        return sign * toNumber(isOctal)
      }
    }

    if (chr === '.') {
      // ex: -5982475.249875e+29384
      //                ^^^ skipping these
      while (position < length && isDecDigit(input[position])) position++
      chr = input[position++]
    }

    if (chr === 'e' || chr === 'E') {
      chr = input[position++]
      if (chr === '-' || chr === '+') position++
      // ex: -5982475.249875e+29384
      //                       ^^^ skipping these
      while (position < length && isDecDigit(input[position])) position++
      chr = input[position++]
    }

    // we have char in the buffer, so count for it
    position--
    return toNumber()
  }

  function parseIdentifier () {
    // rewind because we don't know first char
    position--

    var result = ''

    while (position < length) {
      var chr = input[position++]

      if (chr === '\\' &&
      input[position] === 'u' &&
      isHexDigit(input[position + 1]) &&
      isHexDigit(input[position + 2]) &&
      isHexDigit(input[position + 3]) &&
      isHexDigit(input[position + 4])
      ) {
        // UnicodeEscapeSequence
        chr = String.fromCharCode(parseInt(input.substr(position + 1, 4), 16))
        position += 5
      }

      if (result.length) {
        // identifier started
        if (Uni.isIdentifierPart(chr)) {
          result += chr
        } else {
          position--
          return result
        }
      } else {
        if (Uni.isIdentifierStart(chr)) {
          result += chr
        } else {
          return undefined
        }
      }
    }

    fail()
  }

  function parseString (endChar) {
    // 7.8.4 of ES262 spec
    var result = ''

    while (position < length) {
      var chr = input[position++]

      if (chr === endChar) {
        return result
      } else if (chr === '\\') {
        if (position >= length) fail()
        chr = input[position++]

        if (unescapeMap[chr] && (json5 || (chr !== 'v' && chr !== "'"))) {
          result += unescapeMap[chr]
        } else if (json5 && isLineTerminator(chr)) {
          // line continuation
          newLine(chr)
        } else if (chr === 'u' || (chr === 'x' && json5)) {
          // unicode/character escape sequence
          var off = chr === 'u' ? 4 : 2

          // validation for \uXXXX
          for (var i = 0; i < off; i++) {
            if (position >= length) fail()
            if (!isHexDigit(input[position])) fail('Bad escape sequence')
            position++
          }

          result += String.fromCharCode(parseInt(input.substr(position - off, off), 16))
        } else if (json5 && isOctDigit(chr)) {
          var digits
          if (chr < '4' && isOctDigit(input[position]) && isOctDigit(input[position + 1])) {
            // three-digit octal
            digits = 3
          } else if (isOctDigit(input[position])) {
            // two-digit octal
            digits = 2
          } else {
            digits = 1
          }
          position += digits - 1
          result += String.fromCharCode(parseInt(input.substr(position - digits, digits), 8))
          /* if (!isOctDigit(input[position])) {
            // \0 is allowed still
            result += '\0'
          } else {
            fail('Octal literals are not supported')
          } */
        } else if (json5) {
          // \X -> x
          result += chr
        } else {
          position--
          fail()
        }
      } else if (isLineTerminator(chr)) {
        fail()
      } else {
        if (!json5 && chr.charCodeAt(0) < 32) {
          position--
          fail('Unexpected control character')
        }

        // SourceCharacter but not one of " or \ or LineTerminator
        result += chr
      }
    }

    fail()
  }

  skipWhiteSpace()
  var returnValue = parseGeneric()
  if (returnValue !== undefined || position < length) {
    skipWhiteSpace()

    if (position >= length) {
      if (typeof (options.reviver) === 'function') {
        returnValue = options.reviver.call(null, '', returnValue)
      }
      return returnValue
    } else {
      fail()
    }
  } else {
    if (position) {
      fail('No data, only a whitespace')
    } else {
      fail('No data, empty input')
    }
  }
}

/*
 * parse(text, options)
 * or
 * parse(text, reviver)
 *
 * where:
 * text - string
 * options - object
 * reviver - function
 */
exports.parse = function parseJSON (input, options) {
  // support legacy functions
  if (typeof (options) === 'function') {
    options = {
      reviver: options
    }
  }

  // JSON.parse compat
  if (typeof input !== 'string' || !(input instanceof String)) input = String(input)
  if (options == null) options = {}
  if (options.reserved_keys == null) options.reserved_keys = 'ignore'

  if (options.reserved_keys === 'throw' || options.reserved_keys === 'ignore') {
    if (options.null_prototype == null) {
      options.null_prototype = true
    }
  }

  try {
    return parse(input, options)
  } catch (error) {
    // jju is a recursive parser, so JSON.parse("{{{{{{{") could blow up the stack
    //
    // this catch is used to skip all those internal calls
    if (error instanceof SyntaxError && error.row != null && error.column != null) {
      var syntaxError = SyntaxError(error.message)
      syntaxError.column = error.column
      syntaxError.row = error.row
      throw syntaxError
    }
    throw error
  }
}

exports.tokenize = function tokenizeJSON (input, options) {
  if (options == null) options = {}

  options._tokenize = function (smth) {
    if (options._addstack) smth.stack.unshift.apply(smth.stack, options._addstack)
    tokens.push(smth)
  }

  var tokens = []
  tokens.data = module.exports.parse(input, options)
  return tokens
}
