// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["app/router","app/viewport","app/user","app/controller","app/diagnostics/pages/TagsPage","i18n!app/nls/diagnostics"],function(a,p,s,e,i){"use strict";var n=s.auth("USER");a.map("/diagnostics/tags",n,function(){p.showPage(new i({model:e}))})});