int  "-"?([0-9]|[1-9][0-9]+)
exp  [eE][-+]?[0-9]+
frac  "."[0-9]+

%{
  yy.comment = function () {
    if (!yy.ignoreComments) {
      var lexer = yy.lexer;
      var message = 'Parse error on line ' + (yylineno + 1) + ':'
        + (lexer.showPosition ? '\n' + lexer.showPosition() + '\n' : ' ')
        + 'Unexpected comment';
      this.parseError(message, {
        text: yytext, token: 'COMMENT', line: yylineno, loc: lexer.yyloc
      });
    }
  }
%}

%%

\s+                                  /* skip whitespace */

"//".*                               yy.comment.call(this)
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]  yy.comment.call(this)

{int}{frac}?{exp}?\b    return 'NUMBER'
\"(?:'\\'[\\"bfnrt/]|'\\u'[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f"])*\"    yytext = yytext.substr(1,yyleng-2); return 'STRING'

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
