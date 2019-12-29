Performance of JSON Parsers
===========================

I looked at some parsers, which were [tested with a JSON grammar]. The benchmark was written by the team behind Chevrotain. There might be some optimisations in other parsers possible, but the code should be enough to get a rough overview and also to compare the [quality of error reporting].

I modified the grammars to support extensions to the JSON format, which may be helpful, if you use JSON not only for machine-generated data exchange, but also for hand-edited files, like configuration. I named the original grammars `pure` and the modified ones `extended`. The extensions were:

* Ignoring JavaScript-like single-line and multiple-line comments. Useful for documenting configuration files.
* Accepting single quotes (apostrophes) as string delimiters. Useful for input files using them to avoid escaping of quotation marks.

Code Size
---------

The size of the JavaScript code is important, when the application runs in the web browser.

| File                   | Source  | Minified | Gzipped  |
| :--------------------- | ------: | -------: | -------: |
| hand-built/extended.js |   6.0 kB |   1.8 kB |  0.8 kB |
| jison/extended.js      |  25.5 kB |  11.0 kB |  3.9 kB |
| jju/extended.js        |  29.8 kB |  16.6 kB |  5.4 kB |
| pegjs/extended.js      |  54.1 kB |  13.5 kB |  3.4 kB |
| json5/dist/index.js    |  56.8 kB |  30.9 kB |  9.1 kB |
| chevrotain/extended.js | 403.4 kB | 153.7 kB | 38.3 kB |

Results
-------

This is a result of the [benchmark] run by `npm run benchmarks`. The numbers should be understood as relative ones:

    Parsing JSON data 4589 characters long using:
      the built-in parser x 97,039 ops/sec ±0.69% (92 runs sampled)
      the pure chevrotain parser x 11,981 ops/sec ±0.86% (87 runs sampled)
      the extended chevrotain parser x 11,183 ops/sec ±0.54% (88 runs sampled)
      the standard jsonlint parser x 97,109 ops/sec ±0.81% (93 runs sampled)
      the extended jsonlint parser x 7,256 ops/sec ±0.54% (90 runs sampled)
      the tokenising jsonlint parser x 6,387 ops/sec ±0.44% (88 runs sampled)
      the pure hand-built parser x 7,508 ops/sec ±0.49% (86 runs sampled)
      the extended hand-built parser x 7,517 ops/sec ±0.45% (90 runs sampled)
      the AST parser x 8,008 ops/sec ±0.90% (85 runs sampled)
      the pure jju parser x 7,505 ops/sec ±0.64% (89 runs sampled)
      the extended jju parser x 7,352 ops/sec ±0.45% (90 runs sampled)
      the tokenisable jju parser x 6,636 ops/sec ±0.46% (89 runs sampled)
      the tokenising jju parser x 5,373 ops/sec ±0.54% (89 runs sampled)
      the comments-enabled parser x 6,258 ops/sec ±0.95% (88 runs sampled)
      the pure pegjs parser x 2,803 ops/sec ±0.58% (88 runs sampled)
      the extended pegjs parser x 2,526 ops/sec ±0.74% (87 runs sampled)
      the pure jison parser x 2,460 ops/sec ±0.49% (89 runs sampled)
      the extended jison parser x 2,195 ops/sec ±0.63% (88 runs sampled)
      the JSON5 parser x 1,660 ops/sec ±0.84% (90 runs sampled)
    The fastest one was the built-in parser,the standard jsonlint parser.

I looked further at capabilities and licenses of the parsers.

[Built-in]
----------

* The plain `JSON.parse`, run just with the input string and no reviver.
* The fastest one, of course, but not adaptable.

[Chevrotain]
------------

* Does not generate code from tokens and grammar; uses a coded grammar.
* The fastest one with an adaptable code base.
* Supports a limited recovery to be able to continue parsing after an error occurs.
* Can report all errors that occur in the whole input.
* Differs between lexical and parsing errors.
* The license (Apache 2) is not compatible with JSONLint.

[Hand-built]
------------

* A code example from Chevrotain benchmarks.
* Very fast one.
* Error reporting would need to be improved.
* The license (Apache 2) is not compatible with JSONLint.

[AST]
-----

* Very fast one.
* Generates an AST to analyse the JSON input.
* Does not return JSON data without an additional generator using the AST.

[JJU]
-----

* A part of other utilities to work with JSON/JSON5 documents.
* Very fast one.
* Supports `reviver` for the full compatibility with JSON.parse.
* Can generate tokens to analyse, modify and update the original JSON input.

[comment-json]
--------------

* Very fast one.
* Supports `reviver` for the full compatibility with JSON.parse.
* Supports CJSON - JSON with JavaScript-like comments.

[PEG.JS]
--------

* Uses [PEG] to generate the parser code.
* Still fast, for a generated parser code.

[Jison]
-------

* Accepts grammar in the format of the [Bison] parser generator.
* Used in the [original JSONLint].
* Slower one.

[JSON5]
-------

* Hand-built parser implementing the [JSON5 specification]. Extensions mentioned above were included, and even more, like trailing commas or multi-line strings. No support for pure JSON.
* Slower one.

[JSONLint]
----------

This entry is here just to compare the current implementation to the original "contenders". Based on the [evaluation] results, the current JSONLint uses a hand-coded parser based on [JJU].

[tested with a JSON grammar]: https://sap.github.io/chevrotain/performance/
[quality of error reporting]: ./errorReportingQuality.md
[evaluation]: ./evaluation.md
[benchmark]: ../parse.js
[Built-in]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
[Chevrotain]: https://github.com/SAP/chevrotain
[Hand-built]: https://github.com/sap/chevrotain/blob/gh-pages/performance/jsonParsers/handbuilt/handbuilt.js
[JJU]: http://rlidwka.github.io/jju/
[comment-json]: https://github.com/kaelzhang/node-comment-json
[AST]: https://github.com/vtrushin/json-to-ast
[PEG.JS]: http://pegjs.org/
[Jison]: http://zaach.github.io/jison/
[JSON5]: https://json5.org/
[PEG]: https://en.wikipedia.org/wiki/Parsing_expression_grammar
[Bison]: https://en.wikipedia.org/wiki/GNU_Bison
[JSON5 specification]: https://spec.json5.org/
[original JSONLint]: https://github.com/zaach/jison
