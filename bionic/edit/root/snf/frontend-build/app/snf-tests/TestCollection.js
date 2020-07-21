// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./Test"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:function(e){return e.Query.fromObject({fields:{startedAt:1,finishedAt:1,"program.name":1,result:1,orderNo:1,serialNo:1},sort:{startedAt:-1},limit:-1337,selector:{name:"and",args:[]}})}})});