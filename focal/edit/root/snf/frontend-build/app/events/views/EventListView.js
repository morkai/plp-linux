// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/time","app/i18n","app/core/views/ListView","app/events/templates/list","app/core/templates/userInfo"],function(e,t,r,a,i,s){"use strict";return a.extend({template:i,remoteTopics:{"events.saved":"refreshCollection"},serialize:function(){var e=this;return{events:this.collection.map(function(a){var i=a.get("type"),n=e.prepareData(i,a.get("data")),p=a.get("user"),o=null;return p&&(o={id:p._id,label:p.name,ip:p.ipAddress}),{severity:a.getSeverityClassName(),time:t.format(a.get("time"),"L, LTS"),user:s({userInfo:o}),type:r("events","TYPE:"+i),text:r("events","TEXT:"+i,r.flatten(n))}})}},refreshCollection:function(e,t){if("function"!=typeof this.options.filter||!Array.isArray(e)||e.some(this.options.filter))return a.prototype.refreshCollection.call(this,e,t)},prepareData:function(e,r){return r.$prepared?r:(r.$prepared=!0,r.date&&(r.dateUtc=t.utc.format(r.date,"L"),r.date=t.format(r.date,"L")),r.timestamp&&(r.timestamp=t.format(r.timestamp,"L, LTS")),r)}})});