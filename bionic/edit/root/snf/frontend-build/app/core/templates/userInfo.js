define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<span class="userInfo" data-clickable="'),__append("undefined"==typeof clickable||!0===clickable?1:0),__append('" data-user-id="'),__append(userInfo?userInfo.id:""),__append('">'),userInfo?(__append('<span class="userInfo-label" title="'),__append(userInfo.title||""),__append('">'),__append(escapeFn(userInfo.label)),__append("</span>"),!(userInfo.cname||userInfo.ip&&"0.0.0.0"!==userInfo.ip)||"undefined"!=typeof noIp&&!1!==noIp||(__append(' <span class="userInfo-cname">('),__append(escapeFn(userInfo.cname||userInfo.ip)),__append(")</span>"))):__append("-"),__append("</span>\n");return __output.join("")}});