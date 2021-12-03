define(["h5.rql/index","./util"],function(t,e){"use strict";var r=/^\/(.*?)(?:\?(.*?))?(?:#(.*?))?$/;function i(t){"/"!==t[0]&&(t="/"+t);var e=t.match(r);this.url=t,this.path=("/"===e[1][0]?"":"/")+e[1],this.queryString=e[2]||"",this.fragment=e[3]||"",this.params={},this.query={},this.rql={},this.cancel=!1,this.defineGetters()}return i.prototype.defineGetters=function(){Object.defineProperty(this,"query",{enumerable:!0,configurable:!0,get:function(){return this.parseQueryString()},set:function(t){this.query=t}}),Object.defineProperty(this,"rql",{enumerable:!0,configurable:!0,get:function(){return this.parseRqlString()},set:function(t){this.rql=t}})},i.prototype.parseQueryString=function(){delete this.query;for(var t=this.queryString.split("&"),r={},i=0,n=t.length;i<n;++i){var s=t[i],u=s.indexOf("=");if(-1!==u){var h=e.decodeUriComponent(s.substr(0,u)),o=e.decodeUriComponent(s.substr(u+1));r[h]=o}}return this.query=r,r},i.prototype.parseRqlString=function(){return delete this.rql,this.rql=t.parse(this.queryString),this.rql},i});