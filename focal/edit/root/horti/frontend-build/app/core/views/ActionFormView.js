define(["underscore","app/i18n","app/viewport","app/router","../View","app/core/templates/actionForm"],function(e,t,o,i,r,n){"use strict";function s(e,o,i){return t.bound(t.has(e.nlsDomain,o)?e.nlsDomain:"core",o,i||{})}var a={formMethod:"POST",formAction:"/",formActionText:t.bound("core","ACTION_FORM:BUTTON"),formActionSeverity:"primary",messageText:t.bound("core","ACTION_FORM:MESSAGE"),successUrl:null,cancelUrl:"#",failureText:t.bound("core","ACTION_FORM:MESSAGE_FAILURE"),requestData:null},l=r.extend({template:n,events:{submit:"submitForm"},$errorMessage:null,initialize:function(){e.defaults(this.options,a),this.$errorMessage=null},destroy:function(){this.hideErrorMessage()},serialize:function(){return{formMethod:this.options.formMethod,formAction:this.options.formAction,formActionText:this.options.formActionText,formActionSeverity:this.options.formActionSeverity,messageText:this.options.messageText,cancelUrl:this.options.cancelUrl,model:this.model}},afterRender:function(){this.model&&this.listenToOnce(this.model,"change",this.render)},submitForm:function(){this.hideErrorMessage();var i=this.$('[type="submit"]').attr("disabled",!0),r=this.options,n=r.requestData;n=null==n?void 0:e.isFunction(n)?n.call(this):JSON.stringify(n);var s=this.ajax({type:r.formMethod,url:r.formAction,data:n}),a=this;return s.done(function(t){a.trigger("success",t),e.isString(r.successUrl)&&a.broker.publish("router.navigate",{url:r.successUrl,trigger:!0,replace:!0})}),s.fail(function(e){a.trigger("failure",e);var i=e.responseJSON&&e.responseJSON.error&&e.responseJSON.error.code||"?",n="ACTION_FORM:"+r.actionKey+":"+i,s=t.has(a.options.nlsDomain,n)?t(a.options.nlsDomain,n):r.failureText;s&&(a.$errorMessage=o.msg.show({type:"error",time:3e3,text:s}))}),s.always(function(){i.attr("disabled",!1)}),!1},hideErrorMessage:function(){null!==this.$errorMessage&&(o.msg.hide(this.$errorMessage),this.$errorMessage=null)},onDialogShown:function(){this.$(".form-actions").find(".btn").first().focus()}},{showDialog:function(t){var i=null;if(t.nlsDomain||(t.nlsDomain=t.model.getNlsDomain()),t.nlsDomain){i=s(t,"ACTION_FORM:DIALOG_TITLE:"+t.actionKey);var r=t.labelAttribute?t.model.get(t.labelAttribute):t.model.getLabel();t.messageText||(t.messageText=r?s(t,"ACTION_FORM:MESSAGE_SPECIFIC:"+t.actionKey,{label:r}):s(t,"ACTION_FORM:MESSAGE:"+t.actionKey)),t.formActionText||(t.formActionText=s(t,"ACTION_FORM:BUTTON:"+t.actionKey)),t.failureText||(t.failureText=s(t,"ACTION_FORM:MESSAGE_FAILURE:"+t.actionKey))}!t.formAction&&e.isFunction(t.model.url)&&(t.formAction=t.model.url()),e.isObject(t.requestData)||(t.requestData={}),e.isString(t.requestData.action)||(t.requestData.action=t.actionKey);var n=new l(t);return n.on("success",function(){o.closeDialog()}),o.showDialog(n,i),n},showDeleteDialog:function(e){return e.actionKey="delete",e.formMethod="DELETE",e.formActionSeverity="danger",l.showDialog(e)}});return l});