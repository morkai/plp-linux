define(["moment-timezone","app/socket","app/data/localStorage"],function(t,n,e){"use strict";var o={synced:!1,offset:parseFloat(e.getItem("TIME:OFFSET"))||0,zone:e.getItem("TIME:ZONE")||"Europe/Warsaw",appData:window.TIME||0};function r(t,n){for(t=String(t);t.length<n;)t="0"+t;return t}return delete window.TIME,o.sync=function(){var t=Date.now();n.emit("time",function(n,r){o.offset=(n-t+(n-Date.now()))/2,o.zone=r,o.synced=!0,e.setItem("TIME:OFFSET",o.offset.toString()),e.setItem("TIME:ZONE",o.zone)})},o.getServerMoment=function(){return t.tz(Date.now()+o.offset,o.zone)},o.getMoment=function(n,e){return t.tz(n,e,o.zone)},o.format=function(t,n){var e=o.getMoment(t);return e.isValid()?e.format(n):null},o.utc={getMoment:function(n,e){return t.utc(n,e)},format:function(n,e){var o=t.utc(n);return o.isValid()?o.format(e):null}},o.toTagData=function(t,n){if(!t)return{iso:"?",long:"?",human:"?",daysAgo:0};var e=o.getMoment(t),r=e.valueOf(),a=Date.now();return{iso:e.toISOString(),long:e.format("LLLL"),human:!0===n?e.from(r>a?r:a):e.fromNow(),daysAgo:-e.diff(a,"days")}},o.toSeconds=function(t){if("number"==typeof t)return t;if("string"!=typeof t)return 0;var n={g:3600,h:3600,m:60,s:1,ms:.001},e=t.trim(),o=parseInt(e,10),r=e.match(/([0-9]+):([0-9]+)(?::([0-9]+))?/);if(r)return o=3600*parseInt(r[1],10),o+=60*parseInt(r[2],10),r[3]&&(o+=parseInt(r[3],10)),o;if(!1===/^[0-9]+\.?[0-9]*$/.test(e)){var a,f=/([0-9\.]+)\s*(h|ms|m|s)[a-z]*/gi;for(o=0;null!==(a=f.exec(e));)o+=parseFloat(a[1])*n[a[2].toLowerCase()]}return o},o.toString=function(t,n,e){if("number"!=typeof t||t<=0||isNaN(t))return n?"00:00:00":"0s";t=Math.round(1e3*t)/1e3;var o="",a=Math.floor(t/3600);a>0?(o+=n?r(a,2)+":":" "+a+"h",t%=3600):n&&(o+="00:");var f=Math.floor(t/60);f>0?(o+=n?r(f,2)+":":" "+f+"min",t%=60):n&&(o+="00:");var u=t;return u>=1?(o+=n?r(Math[e?"floor":"round"](u),2):" "+Math[e?"floor":"round"](u)+"s",e&&u%1!=0&&(o+=n?"."+r(Math.round(u%1*1e3),3):" "+Math.round(u%1*1e3)+"ms")):u>0&&""===o?o+=" "+1e3*u+"ms":n&&(o+="00"),n?o:o.substr(1)},n.on("connect",function(){o.sync()}),n.isConnected()&&o.sync(),window.time=o,o});