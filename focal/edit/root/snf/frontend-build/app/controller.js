// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/broker","app/pubsub","app/user","app/tags/TagCollection"],function(e,n,a,t,o,l){"use strict";function i(){if(!s.loading){var a=n.ajax({url:e.result(s.tags,"url")}).done(function(e){r(e.collection)});return s.loading=n.when(a),s.loading.done(function(){s.loaded=!0}),s.loading.always(function(){s.loading=null}),s.loading}}function r(n){var t={},o={silent:!0};0===s.tags.length||Object.keys(n).length!==s.tags.length?(s.tags.reset(n,o),e.forEach(n,function(e){t[e.name]=e.value})):e.forEach(n,function(e){var n,a=s.tags.get(e.name);a?(n=a.get("value"),a.set(e,o)):s.tags.add(e,o),e.value!==n&&(t[e.name]=e.value)}),e.forEach(u,function(n){var a=n.time;e.forEach(u.newValues,function(e,n){var l=s.tags.get(n);l&&a>l.get("lastChangeTime")&&(l.set({lastChangeTime:a,value:e},o),t[n]=e)})}),u=[],s.tags.trigger("reset"),e.isEmpty(t)||a.publish("controller.valuesChanged",t)}var u=[],s={};return s.auth={isEmbedded:function(){return"localhost"===window.location.hostname||window!==window.parent&&-1!==window.navigator.userAgent.indexOf("X11; Linux")}},s.tags=new l([],{paginate:!1}),s.loaded=!1,s.loading=null,s.load=function(){return s.loaded?n.Deferred().resolve().promise():s.loading?s.loading:i()},a.subscribe("socket.connected",function(){i()}),t.subscribe("controller.tagsChanged",function(e){r(e)}),t.subscribe("controller.tagValuesChanged",function(n){if(s.loading)return void u.push({time:n["@timestamp"],newValues:n});var t={};e.forEach(n,function(n,a){var o=s.tags.get(a);o&&!e.isEqual(n,o.get("value"))&&(o.set("value",n),t[a]=n)}),e.isEmpty(t)||a.publish("controller.valuesChanged",t)}),window.controller=s,s});