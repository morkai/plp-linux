define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form class="logInForm" method="post" action="/login">\n  <div id="'),__append(idPrefix),__append('-message" class="message message-inline message-warning hidden"></div>\n  <div class="form-group">\n    <input id="'),__append(idPrefix),__append('-login" name="login" type="text" autocomplete="new-password" class="form-control input-lg" required placeholder="'),__append(helpers.t("LOG_IN_FORM:LABEL:LOGIN")),__append('" autofocus>\n  </div>\n  <div class="form-group">\n    <input id="'),__append(idPrefix),__append('-password" name="password" type="password" class="form-control input-lg" required placeholder="'),__append(helpers.t("LOG_IN_FORM:LABEL:PASSWORD")),__append('">\n  </div>\n  <div id="'),__append(idPrefix),__append('-password2-container" class="form-group hidden">\n    <input id="'),__append(idPrefix),__append('-password2" name="password2" type="password" class="form-control input-lg" placeholder="'),__append(helpers.t("LOG_IN_FORM:LABEL:NEW_PASSWORD2")),__append('">\n  </div>\n  <button class="btn btn-block btn-lg btn-primary logInForm-submit" type="submit">\n    <i class="fa fa-spinner fa-spin logInForm-submit-spinner"></i>\n    <span class="logInForm-submit-label">'),__append(helpers.t("LOG_IN_FORM:SUBMIT:LOG_IN")),__append('</span>\n  </button>\n  <p class="logInForm-links">\n    '),OFFICE365_TENANT&&(__append('\n    <button id="'),__append(idPrefix),__append('-office365" class="btn btn-link hidden logInForm-links-office365" type="button">\n      <i class="fa fa-windows"></i>\n      <span>'),__append(helpers.t("LOG_IN_FORM:LINK:OFFICE365",{OFFICE365_TENANT:OFFICE365_TENANT})),__append("</span>\n    </button>\n    ")),__append('\n    <button id="'),__append(idPrefix),__append('-loginLink" class="btn btn-link" type="button">'),__append(helpers.t("LOG_IN_FORM:LINK:LOG_IN")),__append('</button>\n    <button id="'),__append(idPrefix),__append('-resetLink" class="btn btn-link" type="button">'),__append(helpers.t("LOG_IN_FORM:LINK:RESET")),__append("</button>\n  </p>\n</form>\n");return __output}});