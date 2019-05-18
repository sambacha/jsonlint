const createSuite = require('./createSuite')

const { Parser } = require('./jsonlint-pure').parser
const { ParserWithComments } = require('../lib/jsonlint').parser
const parser = new Parser()
const parserWithComments = new ParserWithComments()

const pkg = require('../package')
const input = JSON.stringify(pkg, undefined, 2)

function parseBuiltIn () {
  JSON.parse(input)
}

function parseCustom () {
  parser.parse(input)
}

function parseWithComments () {
  parserWithComments.parse(input)
}

createSuite(`Parsing JSON string ${input.length} characters long:`)
  .add('the built-in parser', parseBuiltIn)
  .add('the custom parser', parseCustom)
  .add('the parser with comment recognition', parseWithComments)
  .start()
