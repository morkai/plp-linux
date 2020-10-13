define(["require","exports","module"],function(t,i,s){"use strict";function r(t){this.broker=t,this.subscriptions={},this.removeSubscription=this.removeSubscription.bind(this)}s.exports=r,r.prototype.destroy=function(){var t=this.subscriptions;null!==t&&Object.keys(t).forEach(function(i){t[i].cancel()}),this.subscriptions=null,this.broker=null},r.prototype.sandbox=function(){return new r(this)},r.prototype.publish=function(t,i,s){return this.broker.publish(t,i,s),this},r.prototype.subscribe=function(t,i){var s=this.broker.subscribe(t,i);return s.on("cancel",this.removeSubscription),this.subscriptions[s.getId()]=s,s},r.prototype.unsubscribe=function(t){var i=[],s=this.subscriptions;for(var r in s)s.hasOwnProperty(r)&&s[r].getTopic()===t&&i.push(r);for(var o=0,e=i.length;o<e;++o)s[i[o]].cancel();return this},r.prototype.removeSubscription=function(t){delete this.subscriptions[t.getId()]}});