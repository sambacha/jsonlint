var validator = (function () {
  var jsonlint, Ajv, requireDraft
  if (typeof window !== 'undefined') {
    jsonlint = window.jsonlint
    Ajv = window.Ajv
    requireDraft = function (environment) {
      return window.drafts[environment]
    }
  } else {
    jsonlint = require('./jsonlint')
    Ajv = require('ajv')
    requireDraft = function (environment) {
      return require('ajv/lib/refs/' + environment + '.json')
    }
  }

  function compile (schema, environment) {
    var ajv
    if (!environment) {
      ajv = new Ajv({ schemaId: 'auto' })
      ajv.addMetaSchema(requireDraft('json-schema-draft-04'))
      ajv.addMetaSchema(requireDraft('json-schema-draft-06'))
    } else if (environment === 'json-schema-draft-07') {
      ajv = new Ajv()
    } else if (environment === 'json-schema-draft-06') {
      ajv = new Ajv()
      ajv.addMetaSchema(requireDraft('json-schema-draft-06'))
    } else if (environment === 'json-schema-draft-04') {
      ajv = new Ajv({ schemaId: 'id' })
      ajv.addMetaSchema(requireDraft('json-schema-draft-04'))
    } else {
      throw new Error('Unsupported environment for the JSON schema validation: "' +
        environment + '".')
    }
    var validate
    try {
      schema = jsonlint.parse(schema)
      validate = ajv.compile(schema)
    } catch (error) {
      throw new Error('Compiling the JSON schema failed.\n' + error.message)
    }
    return function (data) {
      var result = validate(data)
      if (!result) {
        var message = ajv.errorsText(validate.errors)
        throw new Error(message)
      }
    }
  }

  return { compile: compile }
}())

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  exports.compile = validator.compile
}
