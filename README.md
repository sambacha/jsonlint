# JSON Lint

[![NPM version](https://badge.fury.io/js/%40prantlf%2Fjsonlint.svg)](https://badge.fury.io/js/%40prantlf%2Fjsonlint)
[![Build Status](https://travis-ci.com/prantlf/jsonlint.svg?branch=master)](https://travis-ci.com/prantlf/jsonlint)
[![Coverage Status](https://coveralls.io/repos/github/prantlf/jsonlint/badge.svg?branch=master)](https://coveralls.io/github/prantlf/jsonlint?branch=master)
[![Dependency Status](https://david-dm.org/prantlf/jsonlint.svg)](https://david-dm.org/prantlf/jsonlint)
[![devDependency Status](https://david-dm.org/prantlf/jsonlint/dev-status.svg)](https://david-dm.org/prantlf/jsonlint#info=devDependencies)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A [JSON]/[JSON5] parser and validator with a command-line client. A [pure JavaScript version] of the service provided at [jsonlint.com].

This is a fork of the original package with the following enhancements:

* Handles multiple files on the command line (by Greg Inman).
* Walks directories recursively (by Paul Vollmer).
* Provides 100% compatible interface to the native `JSON.parse` method.
* Optionally recognizes JavaScript-style comments and single quoted strings.
* Optionally ignores trailing commas and reports duplicate object keys as an error.
* Supports [JSON Schema] drafts 04, 06 and 07.
* Prefers the native JSON parser to gain the [best performance], while showing error messages of the same quality.
* Implements JavaScript modules using [UMD] to work everywhere.
* Depends on up-to-date npm modules with no installation warnings.
* Small size - 17.6 kB minified, 6.1 kB gzipped.

Integration to the favourite task loaders is provided by the following NPM modules:

* [`Grunt`] - see [`@prantlf/grunt-jsonlint`]
* [`Gulp`] - see [`@prantlf/gulp-jsonlint`]

## Synopsis

Check syntax of JSON files:

    jsonlint -q data/*.json

Parse a JSON string:

```js
const { parse } = require('@prantlf/jsonlint')
const data = parse('{"creative": false}')
```

Example of an error message:

    Parse error on line 1, column 14:
    {"creative": ?}
    -------------^
    Unexpected token "?"

## Command-line Interface

Install `jsonlint` with `npm`` globally to be able to use the command-line interface in any directory:

    npm i @prantlf/jsonlint -g

Validate a single file:

    jsonlint myfile.json

or pipe the JSON input into `stdin`:

    cat myfile.json | jsonlint

or process all `.json` files in a directory:

    jsonlint mydir

By default, `jsonlint` will either report a syntax error with details or pretty-print the source if it is valid.

### Options

    $ jsonlint -h

    Usage: jsonlint [options] [<file or directory> ...]

    JSON parser and validator - checks syntax and semantics of JSON data.

    Options:
      -s, --sort-keys              sort object keys
      -E, --extensions [ext]       file extensions to process for directory walk
                                   (default: ["json","JSON"])
      -i, --in-place               overwrite the input files
      -t, --indent [char]          characters to use for indentation (default: "  ")
      -c, --compact                compact error display
      -M, --mode                   set other parsing flags according to a format type
      -C, --comments               recognize and ignore JavaScript-style comments
      -S, --single-quoted-strings  support single quotes as string delimiters
      -T, --trailing-commas'       ignore trailing commas in objects and arrays
      -D, --no-duplicate-keys      report duplicate object keys as an error
      -V, --validate [file]        JSON schema file to use for validation
      -e, --environment [env]      which specification of JSON Schema
                                   the validation file uses
      -q, --quiet                  do not print the parsed json to stdin
      -p, --pretty-print           force pretty-printing even for invalid input
      -v, --version                output the version number
      -h, --help                   output usage information

    Parsing mode can be "cjson" or "json5" to enable other flags automatically.
    If no files or directories are specified, stdin will be parsed. Environments
    for JSON schema validation are "json-schema-draft-04", "json-schema-draft-06"
    or "json-schema-draft-07". If not specified, it will be auto-detected.

## Module Interface

Install `jsonlint` with `npm` locally to be able to use the module programmatically:

    npm i @prantlf/jsonlint -S

The only exported item is the `parse` method, which parses a string in the JSON format to a JavaScript object, array, or value:

```js
const { parse } = require('@prantlf/jsonlint')
// Fails at the position of the character "?".
const data2 = parse('{"creative": ?}') // throws an error
// Succeeds returning the parsed JSON object.
const data3 = parse('{"creative": false}')
// Recognizes comments and single-quoted strings.
const data3 = parse("{'creative': true /* for creativity */}", {
  ignoreComments: true,
  allowSingleQuotedStrings: true
})
```

The exported `parse` method is compatible with the native `JSON.parse` method. The second parameter provides the additional functionality:

    parse(input, [reviver|options])

| Parameter  | Description                                 |
| ---------- | ------------------------------------------- |
| `input`    | text in the JSON format (string)            |
| `reviver`  | converts object and array values (function) |
| `options`  | customize parsing options (object)          |

The `parse` method offers more detailed [error information](#error-handling), than the native `JSON.parse` method and it supports additional parsing options:

| Option                     | Description                 |
| -------------------------- | --------------------------- |
| `ignoreComments`           | ignores single-line and multi-line JavaScript-style comments during parsing as another "whitespace" (boolean) |
| `ignoreTrailingCommas`     | ignores trailing commas in objects and arrays (boolean) |
| `allowSingleQuotedStrings` | accepts strings delimited by single-quotes too (boolean) |
| `allowDuplicateObjectKeys` | allows reporting duplicate object keys as an error (boolean) |
| `mode`                     | sets multiple options according to the type of input data (string) |

The `mode` parameter (string) sets parsing options to match a common format of input data:

| Mode    | Description                 |
| ------- | --------------------------- |
| `json`  | complies to the pure standard [JSON] (default if not set) |
| `cjson` | JSON with comments (sets `ignoreComments`) |
| `json5` | complies to [JSON5]  (sets `ignoreComments`, `allowSingleQuotedStrings`, `ignoreTrailingCommas` and enables other JSON5 features) |

### Schema Validation

The parsing method returns the parsed object or throws an error. If the parsing succeeds, you can validate the input against a JSON schema using the `lib/validator` module:

```js
const { parse } = require('@prantlf/jsonlint')
const { compile } = require('@prantlf/jsonlint/lib/validator')
const validate = compile('string with JSON schema')
// Throws an error in case of failure.
validate(parse('string with JSON data'))
```

Compiling JSON schema supports the same options as parsing JSON data (except for `reviver`). They can be passed as the second (object) parameter. The optional second `environment` parameter can be passed either as a string or as an additional property in the options object too:

```js
const validate = compile('string with JSON schema', {
  environment: 'json-schema-draft-04'
})
```

### Performance

This is a part of an output from the [parser benchmark], when parsing a 4.2 KB formatted string ([package.json](./package.json)) with Node.js 10.15.3:

    the built-in parser x 61,588 ops/sec ±0.75% (80 runs sampled)
    the pure jju parser x 11,396 ops/sec ±1.05% (86 runs sampled)
    the extended jju parser x 8,221 ops/sec ±0.99% (87 runs sampled)

A custom JSON parser is [a lot slower] than the built-in one. However, it is more important to have a [clear error reporting] than the highest speed in scenarios like parsing configuration files. Extending the parser with the support for comments and single-quoted strings does not affect significantly the performance.

### Error Handling

If parsing fails, a `SyntaxError` will be thrown with the following properties:

| Property   | Description                               |
| ---------- | ----------------------------------------- |
| `message`  | the full multi-line error message         |
| `reason`   | one-line explanation of the error         |
| `exzerpt`  | part of the input string around the error |
| `pointer`  | "--^" pointing to the error in `exzerpt`  |
| `location` | object pointing to the error location     |

The `location` object contains properties `line`, `column` and `offset`.

The following code logs twice the following message:

    Parse error on line 1, column 14:
    {"creative": ?}
    -------------^
    Unexpected token "?"

```js
const { parse } = require('@prantlf/jsonlint')
try {
  parse('{"creative": ?}')
} catch (error) {
  const { message, reason, exzerpt, pointer, location } = error
  const { column, line, offset } = location.start
  // Logs the complete error message:
  console.log(message)
  // Logs the same text as included in the `message` property:
  console.log(`Parse error on line ${line}, ${column} column:
${exzerpt}
${pointer}
${reason}`)
}
```

## License

Copyright (C) 2012-2019 Zachary Carter, Ferdinand Prantl

Licensed under the MIT license.

[pure JavaScript version]: http://prantlf.github.com/jsonlint/
[jsonlint.com]: http://jsonlint.com
[JSON]: https://tools.ietf.org/html/rfc8259
[JSON5]: https://spec.json5.org
[JSON Schema]: https://json-schema.org
[UMD]: https://github.com/umdjs/umd
[`Grunt`]: https://gruntjs.com/
[`Gulp`]: http://gulpjs.com/
[`@prantlf/grunt-jsonlint`]: https://www.npmjs.com/package/@prantlf/grunt-jsonlint
[`@prantlf/gulp-jsonlint`]: https://www.npmjs.com/package/@prantlf/gulp-jsonlint
[best performance]: ./benchmarks#json-parser-comparison
[parser benchmark]: ./benchmarks#json-parser-comparison
[a lot slower]: ./benchmarks/results/performance.md#results
[clear error reporting]: ./benchmarks/results/errorReportingQuality.md#results
