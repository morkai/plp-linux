// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["backbone","h5.rql/specialOperators","app/broker","app/viewport","app/time","app/core/Router","app/core/pages/ErrorPage"],function(e,r,t,a,o,n,i){"use strict";function c(){var e=JSON.parse(localStorage.WMES_RECENT_LOCATIONS||"[]");e.unshift({date:new Date,href:window.location.href}),e.length>10&&e.pop(),localStorage.WMES_RECENT_LOCATIONS=JSON.stringify(e)}e.Router.prototype._extractParameters=function(e,r){return e.exec(r).slice(1)};var s=new n(t),u=new e.Router;u.route("*catchall","catchall",function(e){s.dispatch(e)}),t.subscribe("router.navigate",function(e){var r=e.url,t=r.charAt(0);"#"!==t&&"/"!==t||(r=r.substr(1));var a=!0===e.trigger,o=!0===e.replace;u.navigate(r,{trigger:a,replace:o}),!a&&o&&s.setCurrentRequest(r)});return t.subscribe("router.404",function(e){var r=e.req;"/404"===r.path?a.showPage(new i({model:{code:404,req:r,previousUrl:s.previousUrl}})):s.dispatch("/404")}),t.subscribe("viewport.page.loadingFailed",function(e){a.showPage(new i({model:{code:e.xhr?e.xhr.status:0,req:s.currentRequest,previousUrl:s.previousUrl,xhr:e.xhr}}))}),c(),window.addEventListener("hashchange",c),window.router=s,s});