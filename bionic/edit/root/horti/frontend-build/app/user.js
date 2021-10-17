define(["underscore","app/i18n","app/broker","app/socket","app/core/util/embedded"],function(e,a,r,t,i){"use strict";var n=[],o=0,l={};t.on("user.reload",function(e){l.reload(e)}),t.on("user.deleted",function(){window.location.reload()});var d=e.assign(window.GUEST_USER||{},{name:a.bound("core","GUEST_USER_NAME")});return delete window.GUEST_USER,l.idProperty="id",l.data=d,l.lang=window.APP_LOCALE||window.appLocale||"pl",l.noReload=!1,l.isReloadLocked=function(){return n.length>0},l.lockReload=function(){return n.push(++o)},l.unlockReload=function(e){n=n.filter(function(a){return a!==e})},l.reload=function(t){t||(t={}),!1===t.loggedIn&&(t.name=a("core","GUEST_USER_NAME"));var i=e.omit(t,["privilegesMap","privilegesString"]),n=e.omit(l.data,["privilegesMap","privilegesString"]);if(!e.isEqual(i,n)){var o=l.isLoggedIn();Object.keys(t).length>0&&(l.data=t),l.data.privilegesMap=null,l.noReload?l.noReload=!1:r.publish("user.reloaded"),o&&!l.isLoggedIn()?r.publish("user.loggedOut"):!o&&l.isLoggedIn()&&r.publish("user.loggedIn")}},l.isLoggedIn=function(){return!0===l.data.loggedIn},l.getLabel=function(e){return l.data.name?String(l.data.name):l.data.lastName&&l.data.firstName?l.data.lastName===l.data.firstName?l.data.lastName:e?l.data.firstName+" "+l.data.lastName:l.data.lastName+" "+l.data.firstName:l.data.login},l.getInfo=function(){var e={};return e[l.idProperty]=l.data._id,e.ip=l.data.ip||l.data.ipAddress||"0.0.0.0",e.cname=window.COMPUTERNAME,e.label=l.getLabel(),l.getInfo.decorators.forEach(function(a){a(e,l.data)}),e},l.getInfo.decorators=[],l.isAllowedTo=function(e){if(!1===l.data.active)return!1;if(l.data.super)return!0;if(!l.data.privileges)return!1;var a=Array.prototype.slice.call(arguments),r=(1===a.length?[e]:a).map(function(e){return Array.isArray(e)?e:[e]}),t=l.isLoggedIn();if(!r.length)return t;for(var n=0,o=r.length;n<o;++n){for(var d=r[n],s=0,g=d.length,u=0;u<g;++u){var p=d[u],c=typeof p;if("function"===c)s+=p()?1:0;else if("string"!==c)g-=1;else if("USER"===p)s+=t?1:0;else if("LOCAL"===p)s+=l.data.local?1:0;else if("EMBEDDED"===p)s+=i.isEnabled()?1:0;else if(/^FN:/.test(p)){var f=p.substring(3);if(-1!==f.indexOf("*"))s+=new RegExp("^"+f.replace(/\*/g,".*?")+"$").test(l.data.prodFunction)?1:0;else s+=l.data.prodFunction===f?1:0}else s+=l.hasPrivilege(d[u])?1:0}if(s===g)return!0}return!1},l.auth=function(){var e=Array.prototype.slice.call(arguments);return function(a,r,t){l.isAllowedTo.apply(l,e)?t():l.isLoggedIn()?require(["app/viewport","app/core/pages/ErrorPage"],function(e,t){e.showPage(new t({model:{code:403,req:a,previousUrl:r}}))}):require(["app/viewport","app/users/pages/LogInFormPage"],function(e,a){e.showPage(new a)})}},l.hasPrivilege=function(a){return l.data.privilegesMap||(Array.isArray(l.data.privileges)||(l.data.privileges=[]),l.data.privilegesString="|"+l.data.privileges.join("|"),l.data.privilegesMap={},e.forEach(l.data.privileges,function(e){l.data.privilegesMap[e]=!0})),"*"===a.charAt(a.length-1)?-1!==l.data.privilegesString.indexOf("|"+a.substr(0,a.length-1)):!0===l.data.privilegesMap[a]},l.getGuestUserData=function(){return window.GUEST_USER||{id:null,login:"guest",name:a.bound("core","GUEST_USER_NAME"),loggedIn:!1,super:!1,privileges:[]}},l.getRootUserData=function(){return window.ROOT_USER||{id:null,login:"root",name:"root",loggedIn:!0,super:!0,privileges:[]}},l.can={},window.user=l,l});