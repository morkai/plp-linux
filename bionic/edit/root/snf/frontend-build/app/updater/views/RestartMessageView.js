// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["app/core/View"],function(e){"use strict";return e.extend({destroy:function(){this.el.ownerDocument.body.style.marginBottom=""},afterRender:function(){this.el.ownerDocument.body.style.marginBottom=this.$el.outerHeight()+15+"px"}})});