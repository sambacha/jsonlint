Evaluation of JSON Parsers
===========================

I looked at some parsers, which were [tested with a JSON grammar]. Although the [performance] comparison shows a clear winner and a very capable runner-up, JSONLint is primarily a tool to validate the input and that is why the [quality of error reporting] is very important too.

The best parser is likely to be chosen specifically for the particular usage scenario. A universal parser will need accepting some compromises.

Universal Parser
----------------

The most understandable messages are reported by [PEG.js]. The performance is not on par with the fastest parsers, but other parsers generated from a grammar specification are even slower.

Validate Standard JSON As Fast As Possible
------------------------------------------

The [built-in] native JSON parser (`JSON.parse`) offers by far the best performance. If the error message is enriched by additional information, which is feasible, it lacks nothing. The message might bee seen short, but it is understandable very well.

Validate Non-Standard JSON
--------------------------

Depending on extra features required, [Chevrotain] and [PEG.js] offer the best quality/performance ratio. Chevrotain is significantly faster, than PEG.js. It tries also harder to explain, what was wrong, which is often quite counterproductive. PEG.js explains the problems well-enough with a single sentence, even ended by a full-stop. However, Chevrotain packs additional features like recovery and reporting all errors instead of just the first one. The extra feature might make it a winner for a flexibly configurable scenario. However, the Chevrotain parser needs significantly more code, than all the others.

Hand-Built Parser
-----------------

Coded parsers showed their superior performance. A well-written [hand-built] parser would aspire for becoming a winner in all categories above (!) except for the "as fast as possible". However, I tested only an example written by the Chevrotain team. It would have to optimized in both criteria - performance and error reporting quality. I would not find it worth beginning, because the performance would probably not exceed Chevrotain's by much. A parser written in JavaScript is more important for parsing and validating non-standard JSON, or primarily validating; not for a fast data exchange. It is about achieving a very good error reporting quality without loosing performance much.

[tested with a JSON grammar]: https://sap.github.io/chevrotain/performance/
[performance]: ./performance.md
[quality of error reporting]: ./errorReportingQuality.md
[benchmark]: ./benchmarks/parse.js
[built-in]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
[Chevrotain]: https://github.com/SAP/chevrotain
[hand-built]: https://github.com/sap/chevrotain/blob/gh-pages/performance/jsonParsers/handbuilt/handbuilt.js
[PEG.JS]: http://pegjs.org/
[Jison]: http://zaach.github.io/jison/
[JSON5]: https://json5.org/
