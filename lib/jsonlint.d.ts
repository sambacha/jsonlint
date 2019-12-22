type ParseMode = 'json' | 'cjson' | 'json5'

interface ParseOptions {
  ignoreComments?: boolean
  ignoreTrailingCommas?: boolean
  allowSingleQuotedStrings?: boolean
  allowDuplicateObjectKeys?: boolean
  mode?: ParseMode
  reviver?: Function
}

/**
 * Parses a string formatted as JSON. It is compatible with the native
 * `JSON.parse` method.
 *
 * @example
 * ```ts
 * import { parse } from '@prantlf/jsonlint'
 * const parsed = parse('string with JSON data')
 * ```
 *
 * @param input - a string input to parse
 * @param reviverOrOptions - either a value reviver or an object
 *                           with multiple options
 * @returns the parsed result - a primitive value, array or object
 */
declare function parse (input: string, reviverOrOptions?: Function | ParseOptions): object

declare module '@prantlf/jsonlint/lib/validator' {
  type Environment = 'json-schema-draft-04' | 'json-schema-draft-06' | 'json-schema-draft-07'

  interface CompileOptions {
    ignoreComments?: boolean
    ignoreTrailingCommas?: boolean
    allowSingleQuotedStrings?: boolean
    allowDuplicateObjectKeys?: boolean
    environment?: Environment
    mode?: ParseMode
  }

  /**
   * Generates a JSON Schema validator.
   *
   * @example
   * ```ts
   * import { compile } from '@prantlf/jsonlint/lib/validator'
   * const validate = compile('string with JSON schema')
   * const parsed = validate('string with JSON data')
   * ```
   *
   * @param schema - a string with the JSON Schema to validate with
   * @param environmentOrOptions - either a string with the version
   *                               of the JSON Schema standard or an object
   *                               with multiple options
   * @returns the validator function
   */
  function compile (schema: string, environmentOrOptions?: Environment | CompileOptions): Function
}

export { parse }
