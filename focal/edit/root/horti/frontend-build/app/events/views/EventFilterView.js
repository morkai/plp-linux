define(["underscore","app/core/util/forms/dateTimeRange","app/core/views/FilterView","app/users/util/setUpUserSelect2","app/events/templates/filter"],function(e,t,i,r,s){"use strict";return i.extend({template:s,events:e.assign({"click a[data-date-time-range]":t.handleRangeEvent},i.prototype.events),defaultFormData:function(){return{type:"",user:"",severity:[]}},termToForm:{time:t.rqlToForm,type:function(e,t,i){i.type=t.args[1]},"user._id":function(e,t,i){i.user=null===t.args[1]?"$SYSTEM":t.args[1]},severity:function(e,t,i){i.severity="eq"===t.name?[t.args[1]]:t.args[1]}},afterRender:function(){i.prototype.afterRender.call(this),this.toggleSeverity(this.formData.severity),this.$id("type").select2({width:300,allowClear:!0,data:this.model.eventTypes.map(function(e){return e.toSelect2Option()})}),r(this.$id("user"),{view:this,width:300})},serializeFormToQuery:function(e){var i=this.$id("type").val().trim(),r=this.$id("user").select2("data"),s=this.fixSeverity();t.formToRql(this,e),""!==i&&e.push({name:"eq",args:["type",i]}),r&&e.push({name:"eq",args:["user._id","$SYSTEM"===r.id?null:r.id]}),1===s.length?e.push({name:"eq",args:["severity",s[0]]}):s.length>1&&e.push({name:"in",args:["severity",s]})},fixSeverity:function(){var e=this.$id("severity").find(".btn"),t=e.filter(".active");0===t.length&&e.addClass("active");var i=t.map(function(){return this.value}).get();return i.length===e.length?[]:i},toggleSeverity:function(e){var t=this.$id("severity").find(".btn");0===e.length?t.addClass("active"):e.forEach(function(e){t.filter("[value="+e+"]").addClass("active")})}})});