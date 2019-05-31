const createSuite = require('./common/createSuite')

const chevrotainParse = require('./chevrotain/pure')
const chevrotainExtendedParse = require('./chevrotain/extended')
const { parse: pegjsParse } = require('./pegjs/pure')
const { parse: pegjsExtendedParse } = require('./pegjs/extended')
const { Parser: JisonParser } = require('./jison/pure').parser
const { Parser: JisonExtendedParser } = require('./jison/extended').parser
const { parse: jjuPureParse } = require('./jju/pure')
const { parse: jjuExtendedParse } = require('./jju/extended')
const jisonParser = new JisonParser()
const jisonExtendedParser = new JisonExtendedParser()
const handbuiltParse = require('./hand-built/pure')
const handbuiltExtendedParse = require('./hand-built/pure')
const JSON5 = require('json5')

const pkg = require('../package')
const input = JSON.stringify(pkg, undefined, 2)

function parseBuiltIn () {
  JSON.parse(input)
}

function parsePureChevrotain () {
  chevrotainParse(input)
}

function parseExtendedChevrotain () {
  chevrotainExtendedParse(input)
}

function parseHandbuilt () {
  handbuiltParse(input)
}

function parseExtendedHandbuilt () {
  handbuiltExtendedParse(input)
}

function parsePureJju () {
  jjuPureParse(input)
}

function parseExtendedJju () {
  jjuExtendedParse(input, { json5: true })
}

function parsePurePegjs () {
  pegjsParse(input)
}

function parseExtendedPegjs () {
  pegjsExtendedParse(input)
}

function parsePureJison () {
  jisonParser.parse(input)
}

function parseExtendedJison () {
  jisonExtendedParser.parse(input)
}

function parseJSON5 () {
  JSON5.parse(input)
}

createSuite(`Parsing JSON data ${input.length} characters long using`)
  .add('the built-in parser', parseBuiltIn)
  .add('the pure chevrotain parser', parsePureChevrotain)
  .add('the extended chevrotain parser', parseExtendedChevrotain)
  .add('the pure hand-built parser', parseHandbuilt)
  .add('the extended hand-built parser', parseExtendedHandbuilt)
  .add('the pure jju parser', parsePureJju)
  .add('the extended jju parser', parseExtendedJju)
  .add('the pure pegjs parser', parsePurePegjs)
  .add('the extended pegjs parser', parseExtendedPegjs)
  .add('the pure jison parser', parsePureJison)
  .add('the extended jison parser', parseExtendedJison)
  .add('the JSON5 parser', parseJSON5)
  .start()
