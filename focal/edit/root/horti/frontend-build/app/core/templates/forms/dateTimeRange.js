define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})formGroup&&(__append('\n<div class="form-group '),__append(hidden?"hidden":""),__append('" data-filter="'),__append(property),__append('">\n')),__append('\n<div id="'),__append(idPrefix),__append("-dateTimeRange-"),__append(property),__append('" class="dateTimeRange" data-property="'),__append(property),__append('" data-utc="'),__append(utc),__append('" data-set-time="'),__append(setTime),__append('" data-type="'),__append(type),__append('" data-start-hour="'),__append(startHour),__append('" data-shift-length="'),__append(shiftLength),__append('">\n  <div class="dateTimeRange-labels '),__append(labels.length>maxLabels?"dateTimeRange-labels-overflow":""),__append('">\n    '),labels.forEach(function(e,p){__append('\n    <div class="dateTimeRange-label '),__append(e.dropdown||e.ranges?"dropdown":""),__append(" "),__append(e.value?"dateTimeRange-is-input":""),__append(" "),__append(labels.length>maxLabels&&p>0?"hidden":""),__append('">\n      <label\n        class="control-label '),__append(e.dropdown||e.ranges?"dropdown-toggle":""),__append('"\n        '),__append(e.dropdown||e.ranges?'data-toggle="dropdown"':""),__append("\n        "),e.value&&(__append('for="'),__append(idPrefix),__append("-"),__append(labelProperty),__append("-"),__append(e.value),__append('"')),__append("\n      >\n        "),e.value&&(__append('\n        <input id="'),__append(idPrefix),__append("-"),__append(labelProperty),__append("-"),__append(e.value),__append('" class="dateTimeRange-label-input" type="radio" name="'),__append(labelProperty),__append('" value="'),__append(e.value),__append('" data-utc="'),__append(e.utc?1:0),__append('">\n        ')),__append("\n        "),__append(e.text),__append("\n        "),(e.dropdown||e.ranges)&&__append('<span class="caret"></span>'),__append("\n      </label>\n      "),e.ranges?(__append("\n      "),ranges=Object.keys(e.ranges),__append('\n        <div class="dropdown-menu dateTimeRange-ranges">\n          '),labels.length>maxLabels&&(__append('\n          <div class="dateTimeRange-ranges-labels">\n            '),labels.forEach(function(p){__append("\n            <a "),p!==e&&__append('href="javascript:void(0)"'),__append(' data-label-value="'),__append(p.value),__append('">'),__append(p.text),__append("</a>\n            ")}),__append("\n          </div>\n          ")),__append('\n          <table class="dateTimeRange-ranges-table">\n            '),ranges.forEach(function(p,a){__append("\n            <tr>\n              <th>"),__append(t("core","dateTimeRange:"+p)),__append("</th>\n              "),e.ranges[p].forEach(function(e,a){__append("\n              <td>\n                "),e&&(__append('\n                <a href="javascript:void(0)" data-date-time-group="'),__append(p),__append('" data-date-time-range="'),__append(e),__append('">\n                  '),t.has("core","dateTimeRange:"+p+":"+e)?(__append("\n                  "),__append(t("core","dateTimeRange:"+p+":"+e)),__append("\n                  ")):t.has("core","dateTimeRange:"+e)?(__append("\n                  "),__append(t("core","dateTimeRange:"+e)),__append("\n                  ")):(__append("\n                  "),__append(e),__append("\n                  ")),__append("\n                </a>\n                ")),__append("\n              </td>\n              ")}),__append("\n            </tr>\n            ")}),__append('\n            <tr>\n              <td colspan="999" class="dateTimeRange-help">'),__append(t("core","dateTimeRange:help")),__append("</td>\n            </tr>\n          </table>\n        </div>\n      ")):e.dropdown&&(__append('\n      <ul class="dropdown-menu">\n        '),e.dropdown.forEach(function(e){__append("\n        <li><a "),__append(e.attrs),__append(">"),__append(e.text),__append("</a></li>\n        ")}),__append("\n      </ul>\n      ")),__append("\n    </div>\n    ")}),__append('\n  </div>\n  <div class="dateTimeRange-fields">\n    <div class="dateTimeRange-field dateTimeRange-from">\n      '),/date|month/.test(type)&&(__append('\n        <input id="'),__append(idPrefix),__append('-from-date" name="from-date" class="form-control" type="'),__append(/month/.test(type)?"month":"date"),__append('" placeholder="'),__append(t("core","dateTimeRange:placeholder:date")),__append('" min="'),__append(minDate),__append('" max="'),__append(maxDate),__append('" '),__append(required.date[0]?"required":""),__append(">\n      ")),__append("\n      "),/time/.test(type)&&(__append('\n      <input id="'),__append(idPrefix),__append('-from-time" name="from-time" class="form-control" type="time" placeholder="'),__append(t("core","dateTimeRange:placeholder:time")),__append('" '),__append(required.time[0]?"required":""),__append(">\n      ")),__append('\n    </div>\n    <div class="dateTimeRange-separator">'),__append(separator),__append('</div>\n    <div class="dateTimeRange-field dateTimeRange-to">\n      '),/date|month/.test(type)&&(__append('\n      <input id="'),__append(idPrefix),__append('-to-date" name="to-date" class="form-control" type="'),__append(/month/.test(type)?"month":"date"),__append('" placeholder="'),__append(t("core","dateTimeRange:placeholder:date")),__append('" min="'),__append(minDate),__append('" max="'),__append(maxDate),__append('" '),__append(required.date[1]?"required":""),__append(">\n      ")),__append("\n      "),/time/.test(type)&&(__append('\n      <input id="'),__append(idPrefix),__append('-to-time" name="to-time" class="form-control" type="time" placeholder="'),__append(t("core","dateTimeRange:placeholder:time")),__append('" '),__append(required.time[1]?"required":""),__append(">\n      ")),__append("\n    </div>\n  </div>\n</div>\n"),formGroup&&__append("\n</div>\n"),__append("\n");return __output}});