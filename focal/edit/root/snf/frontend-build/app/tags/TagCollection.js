// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../socket","../core/Collection","./Tag","i18n!app/nls/tags"],function(e,t,r,n){"use strict";return r.extend({model:n,rqlQuery:"sort(+name)",group:function(t){var r={other:{tags:[],groups:{}}},n=this.toJSON();n.sort(function(e,t){return e.name.localeCompare(t.name)});for(var o=0,u=n.length;o<u;++o){var s=n[o];if(!t||t(s)){var a=n[o+1],l=s.name.split("."),g=l[0],i=null;1===l.length?a&&0===a.name.indexOf(l[0]+".")||(g="other"):/^[0-9]+$/.test(l[1])&&(i=l[1]),r[g]||(r[g]={tags:[],groups:{}}),null===i?r[g].tags.push(s):(r[g].groups[i]||(r[g].groups[i]=[]),r[g].groups[i].push(s))}}return e.forEach(r,function(t,n){e.isEmpty(t.tags)&&e.isEmpty(t.groups)&&delete r[n]}),r},getValue:function(e){var t=this.get(e);return t?t.get("value"):null},setValue:function(e,r,n){t.emit("controller.setTagValue",e,r,n)}})});