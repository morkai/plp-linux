// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["app/router","app/viewport","./pages/DashboardPage","i18n!app/nls/dashboard"],function(a,e,p){"use strict";a.map("/",function(){e.showPage(new p)})});