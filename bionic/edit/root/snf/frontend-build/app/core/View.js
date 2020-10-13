// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","backbone.layout","app/broker","app/socket","app/pubsub","app/i18n","./util"],function(t,e,i,r,s,o,n,p){"use strict";function a(e){var n=this;n.idPrefix=t.uniqueId("v"),n.options=e||{},n.timers={},n.promises=[],t.forEach(n.sections,function(t,e){n.sections[e]="string"!=typeof t||"#"===t?"#"+n.idPrefix+"-"+e:t.replace("#-","#"+n.idPrefix+"-")}),p.defineSandboxedProperty(n,"broker",r),p.defineSandboxedProperty(n,"pubsub",o),p.defineSandboxedProperty(n,"socket",s),i.call(n,e),p.subscribeTopics(n,"broker",n.localTopics,!0),n.remoteTopicsAfterSync?(!0===n.remoteTopicsAfterSync&&(n.remoteTopicsAfterSync="model"),"string"==typeof n.remoteTopicsAfterSync&&n[n.remoteTopicsAfterSync]&&n.listenToOnce(n[n.remoteTopicsAfterSync],"sync",p.subscribeTopics.bind(p,n,"pubsub",n.remoteTopics,!0))):p.subscribeTopics(n,"pubsub",n.remoteTopics,!0)}return p.inherits(a,i),a.prototype.delegateEvents=function(e){if(e||(e=t.result(this,"events")),!e)return this;this.undelegateEvents(),Object.keys(e).forEach(function(i){var r=e[i];if(t.isFunction(r)||(r=this[r]),t.isFunction(r)){var s=i.match(/^(\S+)\s*(.*)$/),o=s[1]+".delegateEvents"+this.cid,n=s[2];""===n?this.$el.on(o,r.bind(this)):(t.isString(this.idPrefix)&&(n=n.replace(/#-/g,"#"+this.idPrefix+"-")),this.$el.on(o,n,r.bind(this)))}},this)},a.prototype.getViews=function(t){return"string"==typeof t&&/^#-/.test(t)&&(t=t.replace("#-","#"+this.idPrefix+"-")),i.prototype.getViews.call(this,t)},a.prototype.setView=function(t,e,r,s){return"string"==typeof t&&/^#-/.test(t)&&(t=t.replace("#-","#"+this.idPrefix+"-")),i.prototype.setView.call(this,t,e,r,s)},a.prototype.cleanup=function(){this.trigger("cleanup",this),this.destroy(),this.cleanupSelect2(),p.cleanupSandboxedProperties(this),t.isObject(this.timers)&&(t.forEach(this.timers,clearTimeout),this.timers=null),this.cancelRequests()},a.prototype.destroy=function(){},a.prototype.cleanupSelect2=function(){var t=this;this.$(".select2-container").each(function(){t.$("#"+this.id.replace("s2id_","")).select2("destroy")})},a.prototype.beforeRender=function(){},a.prototype.serialize=function(){return t.assign(this.getCommonTemplateData(),this.getTemplateData())},a.prototype.getCommonTemplateData=function(){return{idPrefix:this.idPrefix,helpers:this.getTemplateHelpers()}},a.prototype.getTemplateData=function(){return{}},a.prototype.getTemplateHelpers=function(){return{t:this.t.bind(this),props:this.props.bind(this)}},a.prototype.renderPartial=function(t,i){return e(this.renderPartialHtml(t,i))},a.prototype.renderPartialHtml=function(e,i){return e(t.assign(this.getCommonTemplateData(),i))},a.prototype.afterRender=function(){},a.prototype.isRendered=function(){return!0===this.hasRendered},a.prototype.isDetached=function(){return!e.contains(document.documentElement,this.el)},a.prototype.ajax=function(t){return this.promised(e.ajax(t))},a.prototype.promised=function(e){if(!e||!t.isFunction(e.abort))return e;this.promises.push(e);var i=this;return e.always(function(){Array.isArray(i.promises)&&i.promises.splice(i.promises.indexOf(e),1)}),e},a.prototype.cancelRequests=function(){this.promises.forEach(function(t){t.abort()}),this.promises=[]},a.prototype.cancelAnimations=function(t,e){this.$el.stop(!1!==t,!1!==e),this.$(":animated").stop(!1!==t,!1!==e)},a.prototype.$id=function(i){var r="#";return t.isString(this.idPrefix)&&(r+=this.idPrefix+"-"),e(r+i)},a.prototype.getDefaultModel=function(){return this[this.modelProperty]||this.model||this.collection},a.prototype.getDefaultNlsDomain=function(){var t=this.getDefaultModel();return t.getNlsDomain?t.getNlsDomain():t.nlsDomain||"core"},a.prototype.t=function(t,e,i){if(i||"string"==typeof e)return n(t,e,i);var r=this.getDefaultNlsDomain();return"object"==typeof e?n(r,t,e):n(r,t)},a.prototype.props=function(e,i){var r=this;i||(i=e,e=i.data);var s='<div class="props '+(i.first?"first":"")+'">',o=r.getDefaultNlsDomain();return[].concat(t.isArray(i)?i:i.props).forEach(function(p){"string"==typeof p&&(p={id:p});var a=!1!==p.escape&&"!"!==p.id.charAt(0),c=a?p.id:p.id.substring(1),u=p.className||"",l=p.valueClassName||"",f=p.nlsDomain||i.nlsDomain||o,d=p.label||n(f,"PROPERTY:"+c),h=t.isFunction(p.value)?p.value(e[c],p,r):t.isUndefined(p.value)?e[c]:p.value;t.isFunction(p.visible)&&!p.visible(h,p,r)||(null==p.visible||p.visible)&&(a&&(h=t.escape(h)),s+='<div class="prop '+u+'" data-prop="'+c+'"><div class="prop-name">'+d+'</div><div class="prop-value '+l+'">'+h+"</div></div>")}),s+"</div>"},a});