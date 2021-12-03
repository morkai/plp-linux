define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="action-form" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <p>'),__append("function"==typeof messageText?messageText():messageText),__append('</p>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-'),__append(formActionSeverity),__append('">'),__append("function"==typeof formActionText?formActionText():formActionText),__append("</button>\n    "),"#"===cancelUrl?(__append('\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n    ")):(__append('\n    <a class="cancel" href="'),__append(cancelUrl),__append('">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</a>\n    ")),__append("\n  </div>\n</form>\n");return __output.join("")}});