var fs = require('fs')
var path = require('path')
var prefix = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('jsonlintSchemaDrafts', ['exports'], factory) :
  (global = global || self, factory(global.jsonlintSchemaDrafts = {}));
}(this, function (exports) { 'use strict';

`
var suffix = `
  Object.defineProperty(exports, '__esModule', { value: true });
}));
`
var environments = [
  'json-schema-draft-04',
  'json-schema-draft-06',
  'json-schema-draft-07'
]
var source = environments.map(function (environment) {
  var file = path.join(__dirname, '../node_modules/ajv/lib/refs/' + environment + '.json')
  var code = fs.readFileSync(file)
  return 'exports["' + environment + '"] = ' + code
})
console.log(prefix + source.join('\n') + suffix)
