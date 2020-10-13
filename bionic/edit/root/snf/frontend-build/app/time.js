// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["moment-timezone","app/socket"],function(t,n){"use strict";function e(t,n){for(t=String(t);t.length<n;)t="0"+t;return t}var o={synced:!1,offset:parseFloat(localStorage.getItem("TIME:OFFSET"))||0,zone:localStorage.getItem("TIME:ZONE")||"Europe/Warsaw",appData:window.TIME||0};return delete window.TIME,o.sync=function(){var t=Date.now();n.emit("time",function(n,e){o.offset=(n-t+(n-Date.now()))/2,o.zone=e,o.synced=!0,localStorage.setItem("TIME:OFFSET",o.offset.toString()),localStorage.setItem("TIME:ZONE",o.zone)})},o.getServerMoment=function(){return t(Date.now()+o.offset).tz(o.zone)},o.getMoment=function(n,e){return t(n,e).tz(o.zone)},o.getMomentUtc=function(n,e){return t.utc(n,e)},o.format=function(t,n){var e=o.getMoment(t);return e.isValid()?e.format(n):null},o.utc={getMoment:function(n,e){return t.utc(n,e)},format:function(t,n){var e=o.getMomentUtc(t);return e.isValid()?e.format(n):null}},o.toTagData=function(t,n){if(!t)return{iso:"?",long:"?",human:"?",daysAgo:0};var e=o.getMoment(t),r=e.valueOf(),a=Date.now();return{iso:e.toISOString(),long:e.format("LLLL"),human:!0===n?e.from(r>a?r:a):e.fromNow(),daysAgo:-e.diff(a,"days")}},o.toSeconds=function(t){if("number"==typeof t)return t;if("string"!=typeof t)return 0;var n={g:3600,h:3600,m:60,s:1,ms:.001},e=t.trim(),o=parseInt(e,10);if(!1===/^[0-9]+\.?[0-9]*$/.test(e)){var r,a=/([0-9\.]+)\s*(h|ms|m|s)[a-z]*/gi;for(o=0;null!==(r=a.exec(e));)o+=parseFloat(r[1])*n[r[2].toLowerCase()]}return o},o.toString=function(t,n,o){if("number"!=typeof t||t<=0||isNaN(t))return n?"00:00:00":"0s";var r="",a=Math.floor(t/3600);a>0?(r+=n?e(a,2)+":":" "+a+"h",t%=3600):n&&(r+="00:");var f=Math.floor(t/60);f>0?(r+=n?e(f,2)+":":" "+f+"min",t%=60):n&&(r+="00:");var u=t;return u>=1?(r+=n?e(Math[o?"floor":"round"](u),2):" "+Math[o?"floor":"round"](u)+"s",o&&u%1!=0&&(r+=n?"."+e(Math.round(u%1*1e3),3):" "+Math.round(u%1*1e3)+"ms")):u>0&&""===r?r+=" "+1e3*u+"ms":n&&(r+="00"),n?r:r.substr(1)},n.on("connect",function(){o.sync()}),n.isConnected()&&o.sync(),window.time=o,o});