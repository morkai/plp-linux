// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./User"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"select(lastName,firstName,login,email)&sort(+lastName,+firstName)&limit(15)"})});