define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="users-form" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="row">\n        <div class="col-md-6 form-group">\n          <label for="'),__append(idPrefix),__append('-firstName" class="control-label">'),__append(t("users","PROPERTY:firstName")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-firstName" class="form-control" type="text" name="firstName" autofocus maxlength="50">\n        </div>\n        <div class="col-md-6 form-group">\n          <label for="'),__append(idPrefix),__append('-lastName" class="control-label">'),__append(t("users","PROPERTY:lastName")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-lastName" class="form-control" type="text" name="lastName" maxlength="50">\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-6 form-group">\n          <label for="'),__append(idPrefix),__append('-login" class="control-label is-required">'),__append(t("users","PROPERTY:login")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-login" class="form-control" type="text" name="login" required maxlength="50">\n        </div>\n        <div class="col-md-6 form-group">\n          <label for="'),__append(idPrefix),__append('-email" class="control-label">'),__append(t("users","PROPERTY:email")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-email" class="form-control" type="email" name="email" maxlength="100">\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-6 form-group">\n          <label for="'),__append(idPrefix),__append('-password" class="control-label '),__append(editMode?"":"is-required"),__append('">'),__append(t("users","PROPERTY:password")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-password" class="form-control" type="password" name="password" '),__append(editMode?"":"required"),__append('>\n        </div>\n        <div class="col-md-6 form-group">\n          <label for="'),__append(idPrefix),__append('-password2" class="control-label '),__append(editMode?"":"is-required"),__append('">'),__append(t("users","PROPERTY:password2")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-password2" class="form-control" type="password" '),__append(editMode?"":"required"),__append('>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-privileges" class="control-label">'),__append(t("users","PROPERTY:privileges")),__append('</label>\n        <div class="input-group">\n          <input id="'),__append(idPrefix),__append('-privileges" type="text" name="privileges">\n          <span class="input-group-btn">\n            <button id="'),__append(idPrefix),__append('-copyPrivileges" class="btn btn-default" type="button"><i class="fa fa-copy"></i></button>\n          </span>\n        </div>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});