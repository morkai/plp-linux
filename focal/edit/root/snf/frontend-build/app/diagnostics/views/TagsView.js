define(["underscore","jquery","app/time","app/i18n","app/viewport","app/core/View","app/diagnostics/templates/tags","i18n!app/nls/diagnostics"],function(t,e,a,s,n,i,r){"use strict";return i.extend({template:r,events:{"click .tag-value":function(t){this.setTagValue(this.$(t.currentTarget))}},initialize:function(){this.listenTo(this.model,"add remove reset",this.render),this.listenTo(this.model,"change:value",this.updateState)},serialize:function(){var t=this.formatValue.bind(this);return{tags:this.model.map(function(e){return e=e.toJSON(),e.value=t(e.value,e.type),null!==e.unit&&-1!==e.unit||(e.unit="-"),null!==e.address&&-1!==e.address||(e.address="-"),e})}},updateState:function(e){var a=this.$('tr[data-tag="'+e.id+'"] .tag-value');0===a.length||a.is(".tag-changing")||(a.removeClass("highlight"),a.text(this.formatValue(e.get("value"),e.get("type"))),t.defer(function(){a.addClass("highlight")}))},formatValue:function(t,e){switch(e){case"time":return a.format(t||0,"YYYY-MM-DD HH:mm:ss");case"object":if(null==t)return"?";var s=JSON.stringify(t);return s.length>40?s.substring(0,35)+"...":s;default:return null==t?"?":String(t)}},setTagValue:function(t){if(!t.hasClass("tag-changing")&&!t.hasClass("tag-not-writable")){t.addClass("tag-changing");var e=t.closest("tr").attr("data-tag"),a=this.model.get(e);"bool"===a.get("type")?this.setBoolValue(t,e,!a.get("value")):this.showEditor(a,t)}},setBoolValue:function(t,e,a){var s=this;s.model.setValue(e,a,function(n){n&&s.showErrorMessage(n,e,a),t.removeClass("tag-changing")})},showEditor:function(t,a){var s=this,n="object"===t.get("type"),i=t.get("value"),r=a.position(),o=e('<form class="input-group"></form>').css({position:"absolute",top:r.top+4+"px",left:r.left+4+"px",width:n?"600px":a.outerWidth()+"px"}),l=e(n?'<textarea class="form-control" name="value" rows="6" cols="50"></textarea>':'<input class="form-control" name="value" type="text">');o.append(l.val(n?JSON.stringify(i||null,null,2):i)),o.append('<span class="input-group-btn"><input class="btn btn-primary" type="submit" value="&gt;"></span>'),o.submit(function(){var e,n=l.val().trim();if(/^[0-9]+$/.test(n))e=parseInt(n,10);else if(/^[0-9]+\.[0-9]+$/.test(n))e=parseFloat(n);else if("object"===t.get("type"))try{e=JSON.parse(n)}catch(t){e=i}else e=n;var r=t.get("name");return s.model.setValue(r,e,function(t){t&&s.showErrorMessage(t,r,e),a.removeClass("tag-changing")}),o.fadeOut(function(){o.remove()}),!1}),l.on("keyup",function(t){if(27===t.which)return a.removeClass("tag-changing"),o.fadeOut(function(){o.remove()}),!1}),a.append(o),l.select()},showErrorMessage:function(t,e,a){n.msg.show({time:3e3,type:"error",text:s("diagnostics","TAG_WRITE_FAILED",{tag:e,value:a,reason:s("diagnostics",t.code||t.message)})})}})});