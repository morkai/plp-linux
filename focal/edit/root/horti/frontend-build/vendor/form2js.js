!function(e,n){"function"==typeof define&&define.amd?define(n):e.form2js=n()}(this,function(){"use strict";function e(e,r,u){var a=t(e,r,u);return a.length>0?a:n(e,r,u)}function n(e,n,r){for(var u=[],a=e.firstChild;a;)u=u.concat(t(a,n,r)),a=a.nextSibling;return u}function t(e,t,u){var a,i,l,c=function(e,n){return e.name&&""!=e.name?e.name:n&&e.id&&""!=e.id?e.id:""}(e,u);return(a=t&&t(e))&&a.name?l=[a]:""!=c&&e.nodeName.match(/INPUT|TEXTAREA/i)?l=[{name:c,value:i=r(e)}]:""!=c&&e.nodeName.match(/SELECT/i)?(i=r(e),l=[{name:c.replace(/\[\]$/,""),value:i}]):l=n(e,t,u),l}function r(e){if(e.disabled)return null;switch(e.nodeName){case"INPUT":case"TEXTAREA":switch(e.type.toLowerCase()){case"radio":if(e.checked&&"false"===e.value)return!1;case"checkbox":if(e.checked&&"true"===e.value)return!0;if(!e.checked&&"true"===e.value)return!1;if(e.checked)return e.value;break;case"button":case"reset":case"submit":case"image":return"";default:return e.value}break;case"SELECT":return function(e){var n,t,r,u=[];if(!e.multiple)return e.value;for(n=e.getElementsByTagName("option"),t=0,r=n.length;t<r;t++)n[t].selected&&u.push(n[t].value);return u}(e)}return null}return function(n,t,r,u,a){void 0!==r&&null!=r||(r=!0),void 0!==t&&null!=t||(t="."),arguments.length<5&&(a=!1);var i,l=[],c=0;if((n="string"==typeof n?document.getElementById(n):n).constructor==Array||"undefined"!=typeof NodeList&&n.constructor==NodeList)for(;i=n[c++];)l=l.concat(e(i,u,a));else l=e(n,u,a);return function(e,n,t){var r,u,a,i,l,c,s,o,f,h,d,g,m,p={},v={};for(r=0;r<e.length;r++)if(l=e[r].value,!n||""!==l&&null!==l){for(g=e[r].name,m=g.split(t),c=[],s=p,o="",u=0;u<m.length;u++)if((d=m[u].split("][")).length>1)for(a=0;a<d.length;a++)if(0==a?d[a]=d[a]+"]":a==d.length-1?d[a]="["+d[a]:d[a]="["+d[a]+"]",h=d[a].match(/([a-z_]+)?\[([a-z_][a-z0-9_]+?)\]/i))for(i=1;i<h.length;i++)h[i]&&c.push(h[i]);else c.push(d[a]);else c=c.concat(d);for(u=0;u<c.length;u++)(d=c[u]).indexOf("[]")>-1&&u==c.length-1?(f=d.substr(0,d.indexOf("[")),o+=f,s[f]||(s[f]=[]),s[f].push(l)):d.indexOf("[")>-1?(f=d.substr(0,d.indexOf("[")),h=d.replace(/(^([a-z_]+)?\[)|(\]$)/gi,""),v[o+="_"+f+"_"+h]||(v[o]={}),""==f||s[f]||(s[f]=[]),u==c.length-1?""==f?(s.push(l),v[o][h]=s[s.length-1]):(s[f].push(l),v[o][h]=s[f][s[f].length-1]):v[o][h]||(/^[a-z_]+\[?/i.test(c[u+1])?s[f].push({}):s[f].push([]),v[o][h]=s[f][s[f].length-1]),s=v[o][h]):(o+=d,u<c.length-1?(s[d]||(s[d]={}),s=s[d]):s[d]=l)}return p}(l,r,t)}});