var fs = require('fs')
var path = require('path')
var prefix = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('jsonlint', ['exports'], factory) :
  (global = global || self, factory(global.jsonlint = {}));
}(this, function (exports) { 'use strict';

`
var suffix = `

  var Parser = jsonlint.Parser;

  function ConfigurableParser (options) {
    Parser.prototype.constructor.call(this);
    processOptions.call(this, options);
  }

  function parse (input, options) {
    processOptions.call(this, options);
    return Parser.prototype.parse.call(this, input);
  }

  function processOptions (options) {
    if (options) {
      if (options.ignoreComments) {
        this.yy.ignoreComments = true;
      }
      if (options.allowSingleQuotedStrings) {
        this.yy.allowSingleQuotedStrings = true;
      }
    }
  }

  ConfigurableParser.prototype = Object.create(Parser.prototype);
  ConfigurableParser.prototype.constructor = ConfigurableParser;
  ConfigurableParser.prototype.parse = parse;
  ConfigurableParser.prototype.Parser = ConfigurableParser;

  jsonlint = new ConfigurableParser();

  exports.parser = jsonlint;
  exports.Parser = jsonlint.ConfigurableParser;
  exports.parse = function () {
    return jsonlint.parse.apply(jsonlint, arguments);
  };

  Object.defineProperty(exports, '__esModule', { value: true });
}));
`
var scriptFile = path.join(__dirname, '../lib/jsonlint.js')
var scriptSource = fs.readFileSync(scriptFile, 'utf8')
scriptSource = prefix + scriptSource + suffix
fs.writeFileSync(scriptFile, scriptSource)
