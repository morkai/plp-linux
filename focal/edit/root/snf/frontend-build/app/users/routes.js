// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["../broker","../router","../viewport","./pages/LogInFormPage","./util/userInfoPopover","i18n!app/nls/users"],function(e,n,r,o){"use strict";n.map("/login",function(n){e.publish("router.navigate",{url:"/",replace:!0,trigger:!1}),r.showPage(new o({model:{unknown:n.query.unknown}}))})});