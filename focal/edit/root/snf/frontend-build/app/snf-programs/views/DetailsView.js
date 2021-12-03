// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/DetailsView","../Program","app/snf-programs/templates/details"],function(e,t,a,r){"use strict";return t.extend({template:r,getTemplateData:function(){return e.assign(t.prototype.getTemplateData.call(this),a.OPTIONS)}})});