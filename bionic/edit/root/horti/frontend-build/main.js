!function(){"use strict";console&&(console.json=function(){console.log.apply(console,Array.prototype.slice.call(arguments).map(function(e){return JSON.parse(JSON.stringify(e))}))});var e=null;function n(n,i){if(window.fetch&&n.stack!==e){var t=(e=n.stack||"").split(/\s+at\s+/);t.shift(),n={type:n.name,message:n.message,stack:t,time:i?i.timeStamp:-1};var r=window.navigator,a=window.screen,d=o();d["Content-Type"]="application/json",fetch("/logs/browserErrors",{method:"POST",headers:d,body:JSON.stringify({error:n,browser:{time:new Date,navigator:{language:r.language,languages:r.languages,cookieEnabled:r.cookieEnabled,onLine:r.onLine,platform:r.platform,userAgent:r.userAgent},screen:{availHeight:a.availHeight,availWidth:a.availWidth,width:a.width,height:a.height,innerWidth:window.innerWidth,innerHeight:window.innerHeight},location:window.location.href,history:JSON.parse(require("app/data/localStorage").getItem("WMES_RECENT_LOCATIONS")||[])},versions:window.updater&&window.updater.versions||{}})}).then(function(){},function(){})}}function o(){var e={};return window.INSTANCE_ID&&(e["X-WMES-INSTANCE"]=window.INSTANCE_ID),window.COMPUTERNAME&&(e["X-WMES-CNAME"]=window.COMPUTERNAME),window.WMES_APP_ID&&(e["X-WMES-APP"]=window.WMES_APP_ID),window.WMES_LINE_ID&&(e["X-WMES-LINE"]=window.WMES_LINE_ID),window.WMES_STATION&&(e["X-WMES-STATION"]=window.WMES_STATION),window.socket&&window.socket.getId&&(e["X-WMES-SOCKET"]=window.socket.getId()),e}window.WMES_GET_COMMON_HEADERS=o,window.WMES_LOG_BROWSER_ERROR=n,window.addEventListener("error",function(e){n(e.error,e)});var i=window.navigator,t=window.location;"http:"===t.protocol&&"/"===t.pathname&&""===t.port&&(t.protocol="https:"),t.origin||(t.origin=t.protocol+"//"+t.hostname+(t.port?":"+t.port:"")),window.COMPUTERNAME=(t.href.match(/COMPUTERNAME=(.*?)(?:(?:#|&).*)?$/i)||[null,null])[1],window.INSTANCE_ID=Math.round(Date.now()+9999999*Math.random()).toString(36).toUpperCase(),window.IS_EMBEDDED=window.IS_EMBEDDED||window.parent!==window||-1!==window.location.href.indexOf("_embedded=1"),window.IS_IE=-1!==i.userAgent.indexOf("Trident/"),window.IS_MOBILE=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(i.userAgent),window.IS_LINUX=-1!==i.userAgent.indexOf("X11; Linux"),!window.IS_EMBEDDED&&!window.IS_LINUX&&i.serviceWorker&&i.serviceWorker.getRegistrations&&"https:"===t.protocol&&"/"===t.pathname||delete window.SERVICE_WORKER,document.body.classList.toggle("is-ie",window.IS_IE),document.body.classList.toggle("is-mobile",window.IS_MOBILE),document.body.classList.toggle("is-embedded",window.IS_EMBEDDED),document.body.classList.toggle("is-linux",window.IS_LINUX),document.body.dataset.appId=window.WMES_APP_ID;try{window.IS_EMBEDDED&&window.parent.WMES_APP_ID&&(document.body.dataset.parentAppId=window.parent.WMES_APP_ID)}catch(e){}window.IS_EMBEDDED&&(window.parent.postMessage({type:"init",host:t.hostname},"*"),window.addEventListener("message",function e(n){var o=n.data;o&&"init"===o.type&&(window.removeEventListener("message",e),window.WMES_CLIENT=o.data)})),window.SERVICE_WORKER&&window.navigator.serviceWorker.register(window.SERVICE_WORKER).then(function(){console.log("[sw] Registered!")}).catch(function(e){console.error("[sw] Failed to register:",e)});var r=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){var e=o();return Object.keys(e).forEach(function(n){this.setRequestHeader(n,e[n])},this),r.apply(this,arguments)};var a=[],d=null,s=null;require.onError=function(e){console.error(Object.keys(e),e);var n=document.getElementById("app-loading");if(n){n.className="error";var o=n.getElementsByClassName("fa-spin")[0];o&&o.classList.remove("fa-spin")}},require.onResourceLoad=function(e,n){if("i18n"===n.prefix){var o=e.defined[n.id],i=n.id.substr(n.id.lastIndexOf("/")+1);null!==d?d.register(i,o,n.id):a.push([i,o,n.id])}else if("app/i18n"===n.id)(d=e.defined[n.id]).config=e.config.config.i18n,a.forEach(function(e){d.register(e[0],e[1],e[2])}),a=null;else if("select2"===n.id)(s=e.defined[n.id]).lang=function(e){window.jQuery.extend(window.jQuery.fn.select2.defaults,s.lang[e])};else if(/^select2-lang/.test(n.id)){var t=n.id.substr(n.id.lastIndexOf("/")+1);s.lang[t]=e.defined[n.id]}};var w=window.applicationCache;if(!w||0===w.status||!i.onLine||!document.getElementsByTagName("html")[0].hasAttribute("manifest"))return E(0);var l=t.reload.bind(t),c=setTimeout(l,9e4);function p(){clearTimeout(c),c=null,w.onnoupdate=null,w.oncached=null,w.onerror=null,w.onobsolete=null,w.onupdateready=null,E()}function E(e){if(10===e)throw new Error("No window.requireApp()?!");"function"==typeof window.requireApp?window.requireApp():setTimeout(E,1e3,e+1)}w.onnoupdate=p,w.oncached=p,w.onerror=p,w.onobsolete=l,w.onupdateready=l}();