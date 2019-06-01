# JSON Parser Comparison

This project compares the [performance] of JSON parsers and the [quality of error reporting] if an invalid input is encountered with intention to select [the best parsers for particular scenarios].

## Installation

Install additional NPM modules for the benchmarks and generate JSON parsers from grammars:

    npm ci

## Testing

Run [performance tests] to compare the parsing speed:

    node parse

Compare error handling by [testing invalid input] and printing various error messages:

    node fail

If you modify some grammars, you have to regenerate parsers before running the tests again:

    npm run prepare

[performance]: ./results/performance.md
[quality of error reporting]: ./results/errorReportingQuality.md
[the best parsers for particular scenarios]: ./results/evaluation.md
[performance tests]: ./parse.js
[testing invalid input]: ./fail.js
