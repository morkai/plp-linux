define(function(r,e,n){"use strict";function t(r,e){e instanceof t.Options||(e=new t.Options(e));var n={selector:a(e,r.selector)||{},fields:r.fields,sort:r.sort,limit:r.limit<1?0:r.limit,skip:r.skip};return e.compactAnd&&Array.isArray(n.selector.$and)&&1===Object.keys(n.selector).length&&(n.selector=l(n.selector.$and)),n}function a(r,e){if("object"!=typeof e||null===e||"string"!=typeof e.name||!Array.isArray(e.args))return null;switch(e.name){case"and":case"or":case"nor":return o(r,e.name,e.args);case"not":return function(r,e){for(var n={},t=0,i=0,o=e.length;i<o;++i){var s=a(r,e[i]);null!==s&&Object.keys(s).forEach(function(r){if("$"!==r[0]){t+=1,n.hasOwnProperty(r)||(n[r]={});var e=s[r];c(e,!1)?(n[r].hasOwnProperty("$not")||(n[r].$not={}),Object.keys(e).forEach(function(t){"$"===t[0]&&(n[r].$not[t]=e[t])})):n[r].$ne=e}})}return 0===t?null:n}(r,e.args);case"eq":case"ne":case"gt":case"ge":case"lt":case"le":return s(r,e.name,e.args);case"in":case"nin":case"all":if(Array.isArray(e.args[1])&&e.args[1].length>0)return s(r,e.name,e.args);break;case"exists":if("boolean"==typeof e.args[1])return i(r,"exists",e.args[0],e.args[1]);break;case"type":if("number"==typeof e.args[1])return i(r,"type",e.args[0],e.args[1]);break;case"mod":return function(r,e){if(Array.isArray(e[1])&&2===e[1].length&&"number"==typeof e[1][0]&&"number"==typeof e[1][1])return i(r,"mod",e[0],e[1]);if(e.length>=3&&"number"==typeof e[1]&&"number"==typeof e[2])return i(r,"mod",e[0],[e[1],e[2]]);return null}(r,e.args);case"where":if(r.allowWhere&&"string"==typeof e.args[0])return{$where:e.args[0]};break;case"regex":return function(r,e){if(e.length>=2&&("string"==typeof e[1]||e[1]instanceof RegExp)){var n=Array.isArray(e[0])?e[0].join("."):e[0];if(!r.isPropertyAllowed(n))return null;var t=i(r,"regex",n,e[1]);return e.length>=3&&"string"==typeof e[2]&&(t[n].$options=e[2]),t}return null}(r,e.args);case"size":if("number"==typeof e.args[1])return i(r,"size",e.args[0],e.args[1]);break;case"elemMatch":return function(r,e){if(e.length<2)return null;var n=Array.isArray(e[0])?e[0].join("."):e[0];if(!r.isPropertyAllowed(n))return null;(e=[].concat(e)).shift();var t=o(r,"and",e);if(null===t)return null;var a=l(t.$and);return i(r,"elemMatch",n,a)}(r,e.args)}return null}function i(r,e,n,t){if(Array.isArray(n)&&(n=n.join(".")),!r.isPropertyAllowed(n))return null;var a={};return a[n]={},a[n]["$"+e]=t,a}function o(r,e,n){for(var t=[],i=0,o=n.length;i<o;++i){var s=a(r,n[i]);null!==s&&t.push(s)}if(0===t.length)return null;var l={};return l["$"+e]=t,l}function s(r,e,n){if(n.length<2)return null;var t=Array.isArray(n[0])?n[0].join("."):n[0];if(!r.isPropertyAllowed(t))return null;var a=n[1],i={};return"eq"===e?(i[t]=a,i):("le"===e?e="lte":"ge"===e&&(e="gte"),i[t]={},i[t]["$"+e]=a,i)}function l(r){for(var e={},n=0,t=r.length;n<t;++n)u(e,r[n]);return e}function u(r,e){Object.keys(e).forEach(function(n){void 0===r[n]&&(r[n]={}),function(r,e,n){if(c(r[e],!0))if(c(n,!1))for(var t in n)n.hasOwnProperty(t)&&(r[e][t]=n[t]);else r[e]=n}(r,n,e[n])})}function c(r,e){if("object"!=typeof r||null===r)return!1;var n=Object.keys(r);if(0===n.length)return e;for(var t=0,a=n.length;t<a;++t)if("$"===n[t][0])return!0;return!1}e.fromQuery=t,t.Options=function(r){"object"==typeof r&&null!==r||(r={}),this.compactAnd=!r.hasOwnProperty("compactAnd")||!0===r.compactAnd,this.allowWhere=!0===r.allowWhere,this.isPropertyAllowed="function"==typeof r.isPropertyAllowed?r.isPropertyAllowed:this.createPropertyFilter(r)},t.Options.prototype.createPropertyFilter=function(r){if(Array.isArray(r.whitelist)){var e=r.whitelist;return function(r){return-1!==e.indexOf(r)}}if(Array.isArray(r.blacklist)){var n=r.blacklist;return function(r){return-1===n.indexOf(r)}}return function(){return!0}}});