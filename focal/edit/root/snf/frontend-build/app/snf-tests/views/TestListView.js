// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/time","app/core/views/ListView"],function(i,s,e,n){"use strict";return n.extend({className:"is-clickable is-colored",remoteTopics:{"snf.tests.finished":"refreshCollection","snf.tests.saved":function(i){var s=this.collection.get(i._id);s&&(s.set(i),this.render())}},columns:[{id:"orderNo",className:"is-min"},{id:"serialNo",className:"is-min is-number"},{id:"program",className:"is-min"},{id:"startedAt",className:"is-min"},{id:"finishedAt",className:"is-min"},{id:"duration"}],serializeActions:function(){}})});