define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="well">\n  <dl>\n    '),lodash.each(data,function(n,e){__append("\n    <dt>"),__append(escapeFn(e)),__append("\n    "),lodash.isArray(n)?(__append("\n    "),lodash.each(n,function(n){__append("\n    <dd>"),__append(n),__append("\n    ")}),__append("\n    ")):(__append("\n    <dd>"),__append(escapeFn(n)),__append("\n    ")),__append("\n    ")}),__append("\n  </dl>\n</div>\n");return __output}});