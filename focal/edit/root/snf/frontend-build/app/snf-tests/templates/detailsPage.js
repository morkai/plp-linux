define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="tests-details-container"></div>\n  <div class="tests-program-container"></div>\n  <div class="panel panel-default">\n    <div class="panel-heading">'),__append(helpers.t("PANEL:TITLE:charts")),__append('</div>\n    <div class="panel-body tests-charts-container"></div>\n  </div>\n</div>\n');return __output.join("")}});