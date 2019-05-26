int  "-"?([0-9]|[1-9][0-9]+)
exp  [eE][-+]?[0-9]+
frac  "."[0-9]+

%{
  function fail (reason, token) {
    var lexer = yy.lexer
    var message = 'Parse error on line ' + yylineno + ':'
      + (lexer.showPosition ? '\n' + lexer.showPosition() + '\n' : ' ')
      + reason
    this.parseError(message, {
      text: yytext, token: token, line: yylineno, loc: yylloc
    })
  }

  function string (token) {
    yytext = yytext.substr(1, yyleng - 2)
    return token
  }

  // Workaround for a wrong value in yy_.yylloc. lexer.yylloc is correct.
  if (yy.parseError) {
    yy.parseError.yy = yy.lexer
  }

  yy.comment = function () {
    if (!yy.ignoreComments) {
      fail.call(this, 'Unexpected comment', 'COMMENT')
    }
  }

  yy.string = function () {
    return string('STRING')
  }

  yy.singleQuotedString = function () {
    if (yy.allowSingleQuotedStrings) {
      return string('SINGLEQUOTED_STRING')
    }
    fail.call(this, 'Unexpected single-quoted string', 'SINGLEQUOTED_STRING')
  }
%}

%%

\s+                                  /* skip whitespace */

"//".*                               yy.comment.call(this)
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]  yy.comment.call(this)

{int}{frac}?{exp}?\b    return 'NUMBER'
\"(?:'\\'[\\"bfnrt/]|'\\u'[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f"])*\"    return yy.string.call(this)
\'(?:'\\'[\\'bfnrt/]|'\\u'[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f'])*\'    return yy.singleQuotedString.call(this)

"{"      return '{'
"}"      return '}'
"["      return '['
"]"      return ']'
","      return ','
":"      return ':'
"true"   return 'TRUE'
"false"  return 'FALSE'
"null"   return 'NULL'
<<EOF>>  return 'EOF'
.        return 'INVALID'

%%
