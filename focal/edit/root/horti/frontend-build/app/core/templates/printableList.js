define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<table class="table table-bordered table-condensed '),__append(className),__append('">\n  <thead>\n    <tr>\n      '),columns.forEach(function(n){__append("\n      <th>"),__append(n.label),__append("</th>\n      ")}),__append("\n    </tr>\n  </thead>\n  <tbody>\n    "),rows.length||(__append('\n    <tr>\n      <td colspan="'),__append(columns.length+1),__append('">'),__append(t("core","LIST:NO_DATA")),__append("</td>\n    </tr>\n    ")),__append("\n    "),rows.forEach(function(n){__append('\n    <tr class="list-item '),__append(n.className?n.className:""),__append('">\n      '),columns.forEach(function(e){__append("\n      <td>\n        "),null==n[e.id]?(__append("\n        <em>"),__append(t("core","LIST:NO_DATA:cell")),__append("</em>\n        ")):(__append("\n        "),__append(n[e.id]),__append("\n        ")),__append("\n      </td>\n      ")}),__append("\n    </tr>\n    ")}),__append("\n  </tbody>\n</table>\n");return __output}});