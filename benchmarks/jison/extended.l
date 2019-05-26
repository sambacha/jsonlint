int  "-"?([0-9]|[1-9][0-9]+)
exp  [eE][-+]?[0-9]+
frac  "."[0-9]+

%{
  function string (token) {
    yytext = yytext.substr(1, yyleng - 2)
    return token
  }

  yy.string = function () {
    return string('STRING')
  }

  yy.singleQuotedString = function () {
    return string('SINGLEQUOTE_STRING')
  }
%}

%%

\s+                                  /* skip whitespace */

"//".*                               /* skip single-line comments */
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]  /* skip multi-line comments */

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
