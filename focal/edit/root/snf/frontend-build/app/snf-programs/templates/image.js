define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="snf-programs-image">\n  <p class="snf-programs-image-label">'),__append(escapeFn(image.label)),__append('</p>\n  <img src="/snf/programs/'),__append(programId),__append("/images/"),__append(image._id),__append("."),__append(image.type),__append('" alt="'),__append(escapeFn(image.label)),__append('">\n</div>\n');return __output.join("")}});