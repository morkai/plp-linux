// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./TagValue"],function(t,i){"use strict";return t.extend({model:i,rqlQuery:"limit(20)",initialize:function(i,n){t.prototype.initialize.apply(this,arguments),this.tag=n.tag},url:function(){return"/tags/"+this.tag+"/changes"},genClientUrl:function(){return"#analytics/changes/"+this.tag}})});