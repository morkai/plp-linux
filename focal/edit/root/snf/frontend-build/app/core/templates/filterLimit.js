define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="form-group '),__append(hidden?"hidden":""),__append('">\n  <label for="'),__append(idPrefix),__append('-limit">'),__append(t("core","filter:limit")),__append('</label>\n  <input id="'),__append(idPrefix),__append('-limit" class="form-control" name="limit" type="number" min="'),__append(min),__append('" max="'),__append(max),__append('" step="1">\n</div>\n');return __output.join("")}});