var fs = require('fs')
var path = require('path')

var source = 'var jsonlint = (function(){var require=true,module=false;var exports={};' +
  fs.readFileSync(path.join(__dirname, '../lib/jsonlint.js'), 'utf8') +
  'return exports;})()'

console.log(source)
