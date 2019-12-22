import { strict as assert } from 'assert'
import { parse } from '..'
import { compile } from '../lib/validator'

exports['test type declarations for parse'] = () => {
  const result = parse('{}')
  assert.equal(typeof result, 'object')
  parse('{}', () => undefined)
  parse('{}', {})
  parse('{}', { mode: 'json' })
  parse('{}', { mode: 'cjson' })
  parse('{}', { mode: 'json5' })
  parse('{}', {
    ignoreComments: true,
    ignoreTrailingCommas: true,
    allowSingleQuotedStrings: true,
    allowDuplicateObjectKeys: true,
    reviver: () => undefined
  })
  assert.ok(true)
}

exports['test type declarations for compile'] = () => {
  const validate = compile('{}')
  assert.equal(typeof validate, 'function')
  compile('{}', 'json-schema-draft-04')
  compile('{}', 'json-schema-draft-06')
  compile('{}', 'json-schema-draft-07')
  compile('{}', {})
  compile('{}', { mode: 'json' })
  compile('{}', { mode: 'cjson' })
  compile('{}', { mode: 'json5' })
  compile('{}', { environment: 'json-schema-draft-04' })
  compile('{}', { environment: 'json-schema-draft-06' })
  compile('{}', { environment: 'json-schema-draft-07' })
  compile('{}', {
    ignoreComments: true,
    ignoreTrailingCommas: true,
    allowSingleQuotedStrings: true,
    allowDuplicateObjectKeys: true
  })
  assert.ok(true)
}

if (require.main === module) { require('test').run(exports) }
