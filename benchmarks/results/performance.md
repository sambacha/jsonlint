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

    Parsing JSON data 4673 characters long using:
      the built-in parser x 61,588 ops/sec ±0.75% (80 runs sampled)
      the pure chevrotain parser x 14,034 ops/sec ±0.86% (85 runs sampled)
      the extended chevrotain parser x 12,802 ops/sec ±1.20% (86 runs sampled)
      the pure hand-built parser x 9,479 ops/sec ±0.83% (89 runs sampled)
      the extended hand-built parser x 9,339 ops/sec ±1.38% (86 runs sampled)
      the pure jju parser x 11,396 ops/sec ±1.05% (86 runs sampled)
      the extended jju parser x 8,221 ops/sec ±0.99% (87 runs sampled)
      the pure pegjs parser x 2,854 ops/sec ±0.80% (87 runs sampled)
      the extended pegjs parser x 2,619 ops/sec ±1.08% (89 runs sampled)
      the pure jison parser x 2,516 ops/sec ±1.31% (84 runs sampled)
      the extended jison parser x 2,434 ops/sec ±0.74% (89 runs sampled)
      the JSON5 parser x 2,002 ops/sec ±0.54% (90 runs sampled)
    The fastest one was the built-in parser.

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

[JJU]
-----

* A part of other utilities to work with JSON/JSON5 documents.
* Very fast one.
* Supports `reviver` for the full compatibility with JSON.parse.

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

[tested with a JSON grammar]: https://sap.github.io/chevrotain/performance/
[quality of error reporting]: ./errorReportingQuality.md
[benchmark]: ../parse.js
[Built-in]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
[Chevrotain]: https://github.com/SAP/chevrotain
[Hand-built]: https://github.com/sap/chevrotain/blob/gh-pages/performance/jsonParsers/handbuilt/handbuilt.js
[JJU]: http://rlidwka.github.io/jju/
[PEG.JS]: http://pegjs.org/
[Jison]: http://zaach.github.io/jison/
[JSON5]: https://json5.org/
[PEG]: https://en.wikipedia.org/wiki/Parsing_expression_grammar
[Bison]: https://en.wikipedia.org/wiki/GNU_Bison
[JSON5 specification]: https://spec.json5.org/
[original JSONLint]: https://github.com/zaach/jison
