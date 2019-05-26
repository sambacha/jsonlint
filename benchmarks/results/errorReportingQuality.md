# Error Reporting Quality of JSON Parsers

I looked at some parsers, which were [tested with a JSON grammar]. A part of the analysis was [performance], but because JSONLint is a tool to validate the input, the error reporting is very important too. 

I extended the existing error-reporting to always include the following information, as far as it was possible:

* Line and column numbers of the first error occurred.
* 20 characters before and 20 characters after the error occurrence as a context.
* Error message returned by the parser.

## Results

This is a result of the [test] run by `node benchmarks/fail`. I was editing the file `test/passes/comments.txt` and re-rerunning the command above to see how various problems are reported.

### Unknown token

The input included an unknown token - a YAML-like single-line comment:

    {
      # Sets a value to a property.
      "property": "value"
    }

The output was:

    the built-in parser:
      Parse error on line 2, column 3:
      {  # Sets a value to a ...
      ---^
      Unexpected token #

    the chevrotain parser:
      Lexical error on line 2, column 3:
      {  # Sets a value to a ...
      ---^
      unexpected character: ->#<- at offset: 4, skipped 1 characters.

    the hand-built parser:
      Bad string

    the pegjs parser:
      Parse error on line 2, column 3:
      {  # Sets a value to a ...
      ---^
      Expected "}" or string but "#" found.

    the jison parser:
      Parse error on line 1, column 3:
      {  # Sets a value to a
      ---^
      Expecting 'STRING', '}', got 'INVALID'

    the JSON5 parser:
      Parse error on line 2, column 3:
      {  # Sets a value to a ...
      ---^
      JSON5: invalid character '#'

### Misplaced token

The input included a misplaced token - an integer value without a key:

    {
      1,
      "property": "value"
    }

The output was:

    the built-in parser:
      Parse error on line 2, column 3:
      {  1}
      ---^
      Unexpected number

    the chevrotain parser:
      Parse error on line 2, column 3:
      {  1}
      ---^
      Expecting token of type --> RCurly <-- but found --> '1' <--

    the hand-built parser:
      Bad string

    the pegjs parser:
      Parse error on line 2, column 3:
      {  1}
      ---^
      Expected "}" or string but "1" found.

    the jison parser:
      Parse error on line 1, column 3:
      {  1}
      ---^
      Expecting 'STRING', '}', got 'NUMBER'

    the JSON5 parser:
      Parse error on line 2, column 3:
      {  1}
      ---^
      JSON5: invalid character '1'

### Missing key-value separator

The input was missing a separator between an object key and value:

    {
      "property" "value"
    }

The output was:

    the built-in parser:
      Parse error on line 2, column 14:
      {  "property" "value"}
      --------------^
      Unexpected string

    the chevrotain parser:
      Parse error on line 2, column 14:
      {  "property" "value"}
      --------------^
      Expecting token of type --> Colon <-- but found --> '"value"' <--

    the hand-built parser:
      Expected ':' instead of '"'

    the pegjs parser:
      Parse error on line 2, column 14:
      {  "property" "value"}
      --------------^
      Expected ":" but "\"" found.

    the jison parser:
      Parse error on line 2, column 14:
      {  "property" "value"}
      --------------^
      Expecting 'EOF', '}', ':', ',', ']', got 'STRING'

    the JSON5 parser:
      Parse error on line 2, column 14:
      {  "property" "value"}
      --------------^
      JSON5: invalid character '\"'

### Missing value

The input was missing a separator (colon) between an object key and value:

    {
      "property":
    }

The output was:

    the built-in parser:
      Parse error on line 3, column 1:
      {  "property":}
      --------------^
      Unexpected token }

    the chevrotain parser:
      Parse error on line 3, column 1:
      {  "property":}
      --------------^
      Expecting: one of these possible Token sequences:
        1. [StringLiteral]
        2. [NumberLiteral]
        3. [LCurly]
        4. [LSquare]
        5. [True]
        6. [False]
        7. [Null]
      but found: '}'

    the hand-built parser:
      Unexpected '}'

    the pegjs parser:
      Parse error on line 3, column 1:
      {  "property":}
      --------------^
      Expected "[", "false", "null", "true", "{", number, or string but "}" found.

    the jison parser:
      Parse error on line 2, column 1:
      {  "property":}
      --------------^
      Expecting 'STRING', 'NUMBER', 'NULL', 'TRUE', 'FALSE', '{', '[', got '}'

    the JSON5 parser:
      Parse error on line 3, column 1:
      {  "property":}
      --------------^
      JSON5: invalid character '}'

### Missing property separator

The input was missing a separator (comma) between two properties:

    {
      "property": "value"
      "count": 1
    }

The output was:

    the built-in parser:
      Parse error on line 3, column 3:
      ...roperty": "value"  "count": 1}
      ----------------------^
      Unexpected string

    the chevrotain parser:
      Parse error on line 3, column 3:
      ...roperty": "value"  "count": 1}
      ----------------------^
      Expecting token of type --> RCurly <-- but found --> '"count"' <--

    the hand-built parser:
      Expected ',' instead of '"'

    the pegjs parser:
      Parse error on line 3, column 3:
      ...roperty": "value"  "count": 1}
      ----------------------^
      Expected "," or "}" but "\"" found.

    the jison parser:
      Parse error on line 2, column 3:
      ...roperty": "value"  "count": 1}
      ----------------------^
      Expecting 'EOF', '}', ':', ',', ']', got 'STRING'

    the JSON5 parser:
      Parse error on line 3, column 3:
      ...roperty": "value"  "count": 1}
      ----------------------^
      JSON5: invalid character '\"'

### Incomplete input

The input was incomplete, cut after an object property:

    {
      "property": "value"

The output was:

    the built-in parser:
      Parse error on line 3, column 1:
      ..."property": "value"
      ----------------------^
      Unexpected end of JSON input

    the chevrotain parser:
      Parse error on line 3, column 1:
      ..."property": "value"
      ----------------------^
      Expecting token of type --> RCurly <-- but found --> '' <--

    the hand-built parser:
      Expected ',' instead of ''

    the pegjs parser:
      Parse error on line 3, column 1:
      ..."property": "value"
      ----------------------^
      Expected "," or "}" but end of input found.

    the jison parser:
      Parse error on line 2, column 1:
      ..."property": "value"
      ----------------------^
      Expecting '}', ',', got 'EOF'

    the JSON5 parser:
      Parse error on line 3, column 1:
      ..."property": "value"
      ----------------------^
      JSON5: invalid end of input

## Analysis

I subjectively evaluated the quality of the error reports above. The location and context of the error were always feasible to add in the same quality. The evaluation was practically only about the error message itself.

### [Built-in]

The plain `JSON.parse` method prints only the unexpected token and character offset from the beginning of the input. The unexpected token is the character itself, which is readable, but the character offset is inconvenient for manual correcting of JSON files, which use line breaks.

No structured information is included in the error object to be able to provide a better report. It can be improved by parsing the error message, recognising the offset and using it for computation of the line and column and context.

The final message reads quite well, although it is usually very short.

### [Chevrotain]

The message is quite technical, but it contains the unexpected token for better understanding as well. Includes structured information about the error too.

The context information can be added using the character offset of the error.

Additionally, all other error occurrences can be reported, not only the first one.

### [Hand-built]

Error reporting would have to be significantly improved. The code is rather a demonstrator how to hand-write a JSON parser. It was included primarily to evaluate the performance difference. I did not add the error reporting there right away. I would do it only if it were worth building a JSONLint alternative on it.

### [PEG.JS]

Pleasantly readable error message on a single line. Includes structured information about the error.

The context information can be added using the character offset of the error.

### [Jison]

The message is technical, but it contains also the unexpected token for better understanding. The message itself contains also the location and the context, which does not need additional formatting in the client code, but if you need to customize it, it makes it more difficult. Includes structured information about the error too.

The compound message includes the line number of the error occurrence, but not the column number. It can be improved by parsing the message, recognising the column number and inserting the line number there using the structured error information.

Jison appears to return different line number of the error occurrence. If there is a line break, the line is smaller by one, than by all other parsers.

### [JSON5]

A short and technical message. Structured information about the error contains only the line and column, bot not the offset.

The context information can be added using the line and column of the error.

[tested with a JSON grammar]: https://sap.github.io/chevrotain/performance/
[performance]: ./performance.md
[test]: ./benchmarks/fail.js
[Built-in]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
[Chevrotain]: https://github.com/SAP/chevrotain
[Hand-built]: https://github.com/sap/chevrotain/blob/gh-pages/performance/jsonParsers/handbuilt/handbuilt.js
[PEG.JS]: http://pegjs.org/
[Jison]: http://zaach.github.io/jison/
[JSON5]: https://json5.org/
[original JSONLint]: https://github.com/zaach/jison
