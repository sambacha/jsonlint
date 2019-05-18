#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var parser = require('./jsonlint').parser
var formatter = require('./formatter.js').formatter
var JSV = require('JSV').JSV
var pkg = require('../package')

function collectExtensions (extension) {
  return extension.split(',')
}

var options = require('commander')
  .name('jsonlint')
  .usage('[options] [<file or directory> ...]')
  .description(pkg.description)
  .option('-s, --sort-keys', 'sort object keys')
  .option('-E, --extensions [ext]', 'file extensions to process for directory walk', collectExtensions, ['json', 'JSON'])
  .option('-i, --in-place', 'overwrite the input files')
  .option('-t, --indent [char]', 'characters to use for indentation', '  ')
  .option('-c, --compact', 'compact error display')
  .option('-C, --comments', 'recognize and ignore JavaScript-style comments')
  .option('-V, --validate [file]', 'JSON schema file to use for validation')
  .option('-e, --environment [env]', 'which specification of JSON Schema the validation file uses', 'json-schema-draft-03')
  .option('-q, --quiet', 'do not print the parsed json to stdin')
  .option('-p, --pretty-print', 'force pretty-printing even for invalid input')
  .version(pkg.version, '-v, --version')
  .on('--help', () => {
    console.log()
    console.log('If no files or directories are specified, stdin will be parsed.')
  })
  .parse(process.argv)

if (options.comments) {
  parser = new parser.ParserWithComments()
}

var currentFileName = '<stdin>'
if (options.compact) {
  parser.parseError = parser.yy.parseError = parser.lexer.parseError = function (str, hash) {
    console.error(currentFileName + ': line ' + hash.loc.first_line + ', col ' + hash.loc.last_column + ', found: \'' + hash.token + '\' - expected: ' + hash.expected.join(', ') + '.')
    throw new Error(str)
  }
}

function parse (source, file) {
  var parsed
  var formatted
  try {
    parsed = parser.parse(source)
    if (options.sortKeys) {
      parsed = sortObject(parsed)
    }
    if (options.validate) {
      var env = JSV.createEnvironment(options.env)
      var schema = JSON.parse(fs.readFileSync(path.normalize(options.validate), 'utf8'))
      var report = env.validate(parsed, schema)
      if (report.errors.length) {
        throw report.errors.reduce(schemaError, 'Validation Errors:')
      }
    }
    return JSON.stringify(parsed, null, options.indent)
  } catch (e) {
    if (options.prettyPrint) {
      /* From https://github.com/umbrae/jsonlintdotcom:
       * If we failed to validate, run our manual formatter and then re-validate so that we
       * can get a better line number. On a successful validate, we don't want to run our
       * manual formatter because the automatic one is faster and probably more reliable.
       */
      try {
        formatted = formatter.formatJson(source, options.indent)
        // Re-parse so exception output gets better line numbers
        parsed = parser.parse(formatted)
      } catch (e) {
        if (!options.compact) {
          console.log('File:', file)
          console.error(e)
        }
        // force the pretty print before exiting
        console.log(formatted)
      }
    } else {
      if (!options.compact) {
        console.log('File:', file)
        console.error(e)
      }
    }
    process.exit(1)
  }
}

function schemaError (str, err) {
  return str +
         '\n\n' + err.message +
         '\nuri: ' + err.uri +
         '\nschemaUri: ' + err.schemaUri +
         '\nattribute: ' + err.attribute +
         '\ndetails: ' + JSON.stringify(err.details)
}

function processFile (file) {
  currentFileName = path.normalize(file)
  var source = parse(fs.readFileSync(currentFileName, 'utf8'), currentFileName)
  if (options.inPlace) {
    fs.writeSync(fs.openSync(currentFileName, 'w+'), source, 0, 'utf8')
  } else {
    if (!options.quiet) { console.log(source) };
  }
}

function processSources (src, checkExtension) {
  var extensions = options.extensions.map(function (extension) {
    return '.' + extension
  })
  var srcStat
  try {
    srcStat = fs.statSync(src)
    if (srcStat.isFile()) {
      if (checkExtension) {
        var ext = path.extname(src)
        if (extensions.indexOf(ext) < 0) {
          return
        }
      }
      processFile(src)
    } else if (srcStat.isDirectory()) {
      var sources = fs.readdirSync(src)
      for (var i = 0; i < sources.length; i++) {
        processSources(path.join(src, sources[i]), true)
      }
    }
  } catch (err) {
    console.log('WARN', err.message)
  }
}

function main () {
  var files = options.args
  var source = ''
  if (files.length) {
    for (var i = 0; i < files.length; i++) {
      processSources(files[i], false)
    }
  } else {
    var stdin = process.openStdin()
    stdin.setEncoding('utf8')
    stdin.on('data', function (chunk) {
      source += chunk.toString('utf8')
    })
    stdin.on('end', function () {
      if (!options.quiet) { console.log(parse(source, '')) };
    })
  }
}

// from http://stackoverflow.com/questions/1359761/sorting-a-json-object-in-javascript
function sortObject (o) {
  if (Array.isArray(o)) {
    return o.map(sortObject)
  } else if (Object.prototype.toString.call(o) !== '[object Object]') {
    return o
  }
  var sorted = {}
  var key
  var a = []
  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key)
    }
  }
  a.sort()
  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = sortObject(o[a[key]])
  }
  return sorted
}

main()
