define([],function(){"use strict";var s={};function t(t){if(void 0!==s[t])return s[t];var r=0,a=0,e=0,n=t.match(/^#([a-fA-F0-9]{3,6})$/);if(n){var o=n[1];3===o.length?(r=o.substr(0,1),a=o.substr(1,1),e=o.substr(2,1),r+=r,a+=a,e+=e):(r=o.substr(0,2),a=o.substr(2,2),e=o.substr(4,2)),r=parseInt(r,16),a=parseInt(a,16),e=parseInt(e,16)}else(n=t.match(/([0-9]+).*?([0-9]+).*?([0-9]+)/))&&(r=parseInt(n[1],10),a=parseInt(n[2],10),e=parseInt(n[3],10));return s[t]=1-(.299*r+.587*a+.114*e)/255<.3,s[t]}function r(s){"string"==typeof s&&(s={color:s});var r=["label","color"];s.className&&(r=r.concat(s.className));var a=s.title||"",e=s.color.toUpperCase(),n=s.label||e;return t(e)&&r.push("is-contrast"),'<span class="'+r.join(" ")+'" title="'+a+'" style="background: '+e+'">'+n+"</span>"}return r.requiresContrast=t,r});