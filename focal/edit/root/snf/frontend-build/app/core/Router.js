// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","./util","./Request"],function(t,e,r){"use strict";function i(t){this.broker=t,this.routes=[],this.dispatching=!1,this.dispatchQueue=[],this.currentRequest=null,this.previousUrl=null}function n(r,i){return function(n){var u=r.exec(n.path);if(null===u)return!1;var s=u.length;if(1===s)return!0;var h,o=t.isArray(i)?i.length:0;if(s===o+1)for(h=0;h<o;++h)n.params[i[h]]=e.decodeUriComponent(u[h+1]);else for(h=0;h<s;++h)n.params[h]=e.decodeUriComponent(u[h]);return!0}}var u=/([:*])([\w\-]+)?/g,s=/[\-\[\]{}()+?.,\\\^$|#\s]/g;return i.prototype.getCurrentRequest=function(){return this.currentRequest},i.prototype.setCurrentRequest=function(t){this.currentRequest=new r(t)},i.prototype.map=function(t){var e=Array.prototype.slice.call(arguments);e.shift(),this.routes.unshift(this.createMatcher(t),e)},i.prototype.navigate=function(e,r){this.broker.publish("router.navigate",t.assign({url:e},r))},i.prototype.replace=function(t){this.broker.publish("router.navigate",{url:t,trigger:!0,replace:!0})},i.prototype.update=function(t){this.broker.publish("router.navigate",{url:t,trigger:!1,replace:!0})},i.prototype.dispatch=function(e){if(!t.isUndefined(e)){if(null===e&&(e="/"),this.dispatching)return void this.dispatchQueue.push(e);this.dispatching=!0;var i=new r(e);this.broker.publish("router.dispatching",i);var n=this.match(i);if(null===n){this.dispatching=!1;var u=this.dispatchQueue.shift();t.isUndefined(u)?this.broker.publish("router.404",{req:i}):this.dispatch(u)}else this.broker.publish("router.matched",{handlers:n,req:i}),t.defer(this.execute.bind(this,n,i))}},i.prototype.match=function(t){for(var e=this.routes,r=0,i=e.length;r<i;r+=2){if((0,e[r])(t))return e[r+1]}return null},i.prototype.execute=function(t,e){function r(n){n+1<t.length?t[n](e,i,r.bind(null,n+1)):t[n](e,i)}this.currentRequest=e,this.broker.publish("router.executing",{handlers:t,req:e});var i=this.previousUrl;r(0),this.previousUrl=e.url,this.dispatching=!1,this.dispatch(this.dispatchQueue.shift())},i.prototype.createMatcher=function(e){if(e instanceof RegExp)return n(e);if(""===(e=e.trim())||"/"===e)return function(t){return""===t.path||"/"===t.path};var r=[],i=!1,h=e.replace(s,"\\$&");return h=h.replace(u,function(e,n,u){return i=!0,t.isUndefined(u)?"*"===n?".*":e:(r.push(u),"*"===n?"(.*?)":"([^/#?;]*)")}),i?n(new RegExp("^"+h+"$"),r):function(t){return t.path===e}},i});