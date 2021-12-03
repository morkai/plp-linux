// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/viewport","app/core/View","app/snf-programs/templates/image","jquery.kinetic"],function(e,i,n,t,s){"use strict";return t.extend({template:s,dialogClassName:"snf-programs-image-dialog",events:{dblclick:function(){n.closeDialog()}},initialize:function(){this.onResize=e.debounce(this.resize.bind(this),25),i(window).on("resize",this.onResize)},destroy:function(){i(window).off("resize",this.onResize)},getTemplateData:function(){return{programId:this.model.programId,image:this.model.image}},afterRender:function(){this.resize(),this.$el.kinetic()},resize:function(){this.$el.css({maxWidth:window.innerWidth-90+"px",maxHeight:window.innerHeight-90+"px"})}})});