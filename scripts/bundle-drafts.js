var fs = require('fs')
var path = require('path')

var environments = [
  'json-schema-draft-04',
  'json-schema-draft-06',
  'json-schema-draft-07'
]
var drafts = environments.map(function (environment) {
  var draftFile = path.join(__dirname, '../node_modules/ajv/lib/refs/' + environment + '.json')
  var draftSource = fs.readFileSync(draftFile)
  return 'exports["' + environment + '"]=' + draftSource
})
var source = 'var drafts=(function(){var require=true,module=false,exports={};\n' +
  drafts.join('\n') +
  '\nreturn exports})()'

console.log(source)
