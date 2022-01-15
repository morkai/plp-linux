// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","moment","select2","app/broker"],function(n,t,e,r){"use strict";function o(n,t,e){try{return l[n][t](e)}catch(e){if(l[n]&&l[n][t])throw e;return r.publish("i18n.missingKey",{domain:n,key:t}),t}}function i(n,t,e){l[n]=t,"string"==typeof e&&s.push(e),r.publish("i18n.registered",{domain:n,keys:t,moduleId:e})}function u(i,u){var c="en";n.isObject(o.config)&&(c=o.config.locale,o.config.locale=i),s.forEach(require.undef);var f=[].concat(s);"en"!==i&&f.unshift("moment-lang/"+i),f.unshift("select2-lang/"+i),require(f,function(){t.locale(i),e.lang(i),r.publish("i18n.reloaded",{oldLocale:c,newLocale:i}),n.isFunction(u)&&u()})}function c(n,t,e){function r(){return o(n,t,e)}return r.toString=r,r}function f(n,t){return void 0!==l[n]&&"function"==typeof l[n][t]}function a(t){var e={};if(null==t)return e;for(var r=Object.keys(t),o=0,i=r.length;o<i;++o){var u=r[o],c=t[u];if(null!==c&&"object"==typeof c)for(var f=a(c),l=Object.keys(f),s=0,g=l.length;s<g;++s)e[u+"->"+l[s]]=String(f[l[s]]);else e[u]="_"===u.charAt(0)?String(c):n.escape(String(c))}return e}var l={},s=[];return o.config=null,o.translate=o,o.register=i,o.reload=u,o.bound=c,o.has=f,o.flatten=a,o.forDomain=function(n){var t=function(t,e,r){return"object"==typeof e?o(n,t,e):"string"==typeof e||r?o(t,e,r):o(n,t)};return t.translate=t,t.bound=function(n,e,r){function o(){return t(n,e,r)}return o.toString=o,o},t.has=function(t,e){return e?f(t,e):f(n,t)},t.flatten=a,t},window.i18n=o,o});