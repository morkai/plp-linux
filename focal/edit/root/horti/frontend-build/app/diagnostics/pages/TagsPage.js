define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","app/diagnostics/views/TagsView"],function(i,e,t,n){"use strict";return t.extend({layoutName:"page",breadcrumbs:function(){return[i.bound("diagnostics","BREADCRUMBS:base"),i.bound("diagnostics","BREADCRUMBS:tags")]},initialize:function(){e(this.model.tags,this),this.view=new n({model:this.model.tags})},load:function(i){return i(this.model.load())}})});