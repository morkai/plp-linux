define(["require","exports","module","./Term","./valueConverters"],function(e,t,r){"use strict";function n(e){this.options=e instanceof n.Options?e:new n.Options(e)}var a=e("./Term"),o=e("./valueConverters");r.exports=n;var s=/^[\+\*\$\-:\w%\._!'~]$/,l=/[\+\*\$\-:\w%\._!'~]*\/[\+\*\$\-:\w%\._!'~\/]*/g,i=new RegExp("(\\([\\+\\*\\$\\-:\\w%\\._,]+\\)|[\\+\\*\\$\\-:\\w%\\._]*|)([<>!]?=(?:[\\w]*=)?|>|<)(\\([\\+\\*\\$\\-:\\w%\\._,!'~]*\\)|[\\+\\*\\$\\-:\\w%\\._!'~]*|)","g"),u={"=":"eq","==":"eq",">":"gt",">=":"ge","<":"lt","<=":"le","!=":"ne"};n.Options=function(e){"object"==typeof e&&null!==e||(e={}),this.jsonQueryCompatible=!0===e.jsonQueryCompatible,this.fiqlCompatible=!e.hasOwnProperty("fiqlCompatible")||!0===e.fiqlCompatible,this.allowSlashedArrays=!0===e.allowSlashedArrays,this.allowEmptyValues=!0===e.allowEmptyValues,this.defaultValueConverter="function"==typeof e.defaultValueConverter?e.defaultValueConverter:o.default,this.specialTerms=Array.isArray(e.specialTerms)?e.specialTerms:[],this.emptyValue=e.hasOwnProperty("emptyValue")?e.emptyValue:""},n.prototype.parse=function(e,t){var r="object"==typeof t&&null!==t,n=this.options.specialTerms,o=null,l=new a,i=[],u=!0;this.options.jsonQueryCompatible&&(e=this.makeJsonQueryCompatible(e)),this.options.allowSlashedArrays&&(e=this.convertSlashedArrays(e)),this.options.fiqlCompatible&&(e=this.convertFiql(e));for(var p=0,h=e.length;p<h;++p){var c=e[p];switch(c){case"(":i.push(l),l=new a(o),r&&null!==o&&-1!==n.indexOf(o)&&(delete t[o],t[o]=l.args),o=null,u=!0;break;case",":if(!1===u){if(!this.options.allowEmptyValues)throw new Error("Empty value at position "+p+" is not allowed.");o=this.options.emptyValue}null!==o&&(l.args.push(this.convertStringToValue(o)),o=null),u=!1;break;case")":null!==o&&(l.args.push(this.convertStringToValue(o)),o=null);var f=null===l.name?l.args:l;l=i.pop(),l.args.push(f),u=!0;break;case"&":case"|":var m="&"===c?"and":"or";if(null!==l.name&&l.name!==m)throw new Error("Can not mix conjunctions within a group at position "+p+", use parenthesises around each set of the same conjunctions (& and |)");l.name="&"===c?"and":"or",null!==o&&(l.args.push(this.convertStringToValue(o)),o=null);break;default:if(!s.test(c))throw new Error("Invalid character at position "+p+": '"+c+"' ("+c.charCodeAt(0)+")");null===o?o=c:o+=c,u=!0}}return null!==o&&l.args.push(this.convertStringToValue(o)),null===l.name&&(l.name="and"),"and"===l.name&&1===l.args.length&&l.args[0]instanceof a&&"and"===l.args[0].name&&(l=l.args[0]),l},n.prototype.makeJsonQueryCompatible=function(e){return this.options.jsonQueryCompatible&&(e=e.replace(/%3C=/g,"=le=").replace(/%3E=/g,"=ge=").replace(/%3C/g,"=lt=").replace(/%3E/g,"=gt=")),e},n.prototype.convertSlashedArrays=function(e){return-1!==e.indexOf("/")?e.replace(l,function(e){return"("+e.replace(/\//g,",")+")"}):e},n.prototype.convertFiql=function(e){return e.replace(i,function(e,t,r,n){return(r=r.length<3?u[r]:r.substring(1,r.length-1))+"("+t+","+n+")"})},n.prototype.convertStringToValue=function(e){var t,r=e.indexOf(":");if(-1!==r){var n=e.substr(0,r);if(void 0===(t=o[n]))throw new Error("Unknown value converter: "+n);e=e.substr(r+1)}else t=this.options.defaultValueConverter;return t(e,this)}});