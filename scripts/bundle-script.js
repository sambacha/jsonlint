var fs = require('fs')

var scriptFile = process.argv[2]
var exportName = process.argv[3]

var source = 'var ' + exportName +
  '=(function(){var require=true,module=false,exports={};\n' +
  fs.readFileSync(scriptFile, 'utf8') +
  '\nreturn exports})()'

console.log(source)
