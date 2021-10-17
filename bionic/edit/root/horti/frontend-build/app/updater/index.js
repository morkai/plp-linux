define(["../broker","../pubsub","../socket","../viewport","../time","./views/RestartMessageView","app/updater/templates/backendRestart","app/updater/templates/frontendRestart","i18n!app/nls/updater"],function(e,n,t,i,r,s,o,u){"use strict";var a="VERSIONS",d={},l=null,p=null,c=!1,f=!1,w=!1,b=!0,m=window[a],v=JSON.parse(localStorage.getItem(a)||"null");function g(){d.versions.time=Date.now(),localStorage.setItem(a,JSON.stringify(d.versions))}function k(){f||(f=!0,window.addEventListener("mousemove",R),window.addEventListener("keypress",R),b&&(null!==p&&p.remove(),p=new s({template:u,type:"frontend"}),i.insertView(p).render(),p.$el.slideDown()),e.publish("updater.frontendRestarting"),R())}function R(){clearTimeout(l),l=setTimeout(V,6e4)}function V(){t.isConnected()&&(w=!0,e.publish("updater.frontendReloading"),window.location.reload())}return delete window[a],d.versions=v&&v.time>r.appData?v:m,d.isRestarting=function(){return c||f},d.isBackendRestarting=function(){return c},d.isFrontendRestarting=function(){return f},d.isFrontendReloading=function(){return w},d.enableViews=function(){b=!0},d.disableViews=function(){b=!1},d.pull=function(e){t.emit("updater.pull",e)},d.getCurrentVersionString=function(){return d.versions.package},g(),t.on("updater.versions",function(e){var n=d.versions;d.versions=e,g(),e.frontend!==n.frontend&&k()}),n.subscribe("updater.newVersion",function(n){e.publish("updater.newVersion",n),"backend"===n.service?function(){if(c)return;c=!0,b&&(null!==p&&p.remove(),p=new s({template:o,type:"backend"}),i.insertView(p).render(),p.$el.slideDown());e.subscribe("socket.connected").setLimit(1).on("message",function(){c=!1,null!==p&&p.$el.slideUp(function(){"backend"===p.options.type&&(p.remove(),p=null)}),e.publish("updater.backendRestarted")}),e.publish("updater.backendRestarting")}():"frontend"===n.service&&k()}),window.updater=d,d});