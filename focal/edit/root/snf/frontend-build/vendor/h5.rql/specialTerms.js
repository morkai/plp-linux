define(["require","exports","module"],function(r,s,t){"use strict";function e(r,s,t){r.fields={};for(var e="select"===s,i=0,n=t.length;i<n;++i){var o=t[i];Array.isArray(o)&&(o=o.join(".")),r.fields[o]=e}}function i(r,s,t){r.sort={};for(var e=0,i=t.length;e<i;++e){var n=t[e];Array.isArray(n)&&(n=n.join(".")),"-"===n[0]?r.sort[n.substr(1)]=-1:"+"===n[0]?r.sort[n.substr(1)]=1:r.sort[n]=1}}function n(r,s,t){var e=parseInt(t[0],10),i=0;t.length>1&&(i=parseInt(t[1],10)),r.limit=isNaN(e)?-1:e,r.skip=isNaN(i)||i<0?0:i}t.exports={select:e,exclude:e,sort:i,limit:n}});