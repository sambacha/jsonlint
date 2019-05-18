# JSON Lint

[![NPM version](https://badge.fury.io/js/%40prantlf%2Fjsonlint.svg)](https://badge.fury.io/js/%40prantlf%2Fjsonlint)
lint)
[![Dependency Status](https://david-dm.org/prantlf/jsonlint.svg)](https://david-dm.org/prantlf/jsonlint)
[![devDependency Status](https://david-dm.org/prantlf/jsonlint/dev-status.svg)](https://david-dm.org/prantlf/jsonlint#info=devDependencies)

A pure [JavaScript version](http://prantlf.github.com/jsonlint/) of the service provided at [jsonlint.com](http://jsonlint.com).

This is a fork of the original package with the following extensions:

* Handles multiple files on the command line (Greg Inman)
* Walks directories recursively (Paul Vollmer)
* Depends on up-to-date npm modules without installation warnings

## Command-line Interface

Install jsonlint with npm to use the command line interface:

    npm install @prantlf/jsonlint -g

Validate a file like so:

    jsonlint myfile.json

or pipe input into stdin:

    cat myfile.json | jsonlint

or process all `.json` files in a directory:

    jsonlint mydir

`jsonlint` will either report a syntax error with details or pretty print the source if it is valid.

### Options

    $ jsonlint -h

    Usage: jsonlint [file [file [...]]] [options]

    file     files or directories to parse; otherwise uses stdin

    Options:
       -v, --version            print version and exit
       -s, --sort-keys          sort object keys
       -i, --in-place           overwrite the file
       -t CHAR, --indent CHAR   character(s) to use for indentation  [  ]
       -c, --compact            compact error display
       -V, --validate           a JSON schema to use for validation
       -e, --environment        which specification of JSON Schema the validation file uses  [json-schema-draft-03]
       -q, --quiet              do not print the parsed json to STDOUT  [false]
       -p, --pretty-print       force pretty printing even if invalid


## Module Interface

I'm not sure why you wouldn't use the built in `JSON.parse` but you can use jsonlint from a CommonJS module:

    var jsonlint = require("jsonlint");

    jsonlint.parse('{"creative?": false}');

It returns the parsed object or throws an `Error`.

## Vim Plugins

* [Syntastic](http://www.vim.org/scripts/script.php?script_id=2736)
* [sourcebeautify](http://www.vim.org/scripts/script.php?script_id=4079) 

## License

Copyright (C) 2012-2019 Zachary Carter
Copyright (c) 2019 Ferdinand Prantl

Licensed under the MIT license.
