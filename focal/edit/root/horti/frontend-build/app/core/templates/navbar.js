define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output="";function __append(a){void 0!==a&&null!==a&&(__output+=a)}with(locals||{})__append('<div class="navbar-inner">\n  <div class="navbar-header">\n    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">\n      <span class="sr-only">'),__append(t("NAVBAR:TOGGLE")),__append('</span>\n      <span class="icon-bar"></span>\n      <span class="icon-bar"></span>\n      <span class="icon-bar"></span>\n    </button>\n    <a class="navbar-brand fa fa-lightbulb-o" href="#"></a>\n  </div>\n  <div class="collapse navbar-collapse navbar-collapse">\n    <ul class="nav navbar-nav">\n      <li><a href="#">'),__append(t("NAVBAR:DASHBOARD")),__append('</a>\n      <li data-online data-privilege="EVENTS:VIEW" data-module><a href="#events">'),__append(t("NAVBAR:EVENTS")),__append('</a>\n      <li data-online data-privilege="LOCAL USER" data-module="horti-tests"><a href="#horti/tests">'),__append(t("NAVBAR:TESTS")),__append('</a>\n      <li data-online data-privilege="HORTI:MANAGE" data-module="controller"><a href="#diagnostics/tags">'),__append(t("NAVBAR:DIAGNOSTICS")),__append('</a>\n    </ul>\n    <ul class="nav navbar-nav navbar-right">\n      <li data-online data-module="horti-tests"><a id="'),__append(id("hortiProgram")),__append('" href="javascript:void(0)">'),__append(t("NAVBAR:PROGRAM")),__append('</a>\n      <li class="dropdown navbar-account-dropdown">\n        <a href="#account" class="dropdown-toggle" data-toggle="dropdown">\n          <i class="fa fa-user fa-lg navbar-account-status"></i>\n          '),__append(user.getLabel()),__append('\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li data-online data-loggedin=0><a class="navbar-account-logIn" href="#login">'),__append(t("NAVBAR:LOG_IN")),__append('</a>\n          <li data-online data-loggedin><a class="navbar-account-logOut" href="/logout">'),__append(t("NAVBAR:LOG_OUT")),__append("</a>\n        </ul>\n      </li>\n    </ul>\n  </div>\n</div>\n");return __output}});