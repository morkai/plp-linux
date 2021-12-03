// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/viewport","app/core/View","app/dashboard/templates/orderPicker"],function(t,e,i,r,d){"use strict";return r.extend({template:d,events:{"click .dashboard-list .btn":function(t){this.$id("order").val(t.currentTarget.dataset.id),this.validateOrder()},"input #-order":function(){this.validateOrder()},submit:function(t){t.preventDefault();var e=this.$id("order"),i={orderNo:e.val(),qtyTodo:e.data("qty")};this.trigger("picked",i)}},initialize:function(){e(window).on("resize."+this.idPrefix,this.resize.bind(this))},destroy:function(){e(window).off("."+this.idPrefix),this.options.vkb&&this.options.vkb.hide()},onDialogShown:function(){this.resize(),this.$id("order").focus()},afterRender:function(){var t=this.model.get("order")||"";"000000000"===t&&(t=""),this.$id("order").val(t),this.loadOrders(),this.validateOrder()},resize:function(){this.heightOffset||(this.heightOffset=this.$el.closest(".modal-content").outerHeight()-this.$id("doneGroup").outerHeight()+25+60);var t=window.innerHeight-this.heightOffset;this.$(".dashboard-list").css("height",t+"px")},loadOrders:function(){function t(t,i){var r="";i.forEach(function(t){r+='<button type="button" class="btn btn-lg btn-block btn-default" data-id="'+t.orderId+'">'+t.orderId.match(/[0-9]{3}/g).join(" ")+"</button>"}),r+='<div class="dashboard-list-last"></div>',e.$id(t).html(r)}var e=this,i=e.ajax({url:"/snf/tests;getLineOrders"});i.fail(function(){e.$(".fa-spin").removeClass("fa-spin")}),i.done(function(e){t("done",e.execution.doneOrders),t("todo",e.execution.todoOrders)})},validateOrder:function(){var t=this,e=t.$(".btn-primary").prop("disabled",!0),i=t.$id("order"),r=i.val();if(i[0].setCustomValidity(""),!/^[0-9]{9}$/.test(r))return void e.prop("disabled",!1);t.validateReq&&t.validateReq.abort(),t.validateReq=t.ajax({url:"/snf/tests;checkSapOrder?orderNo="+r}),t.validateReq.fail(function(){404===t.validateReq.status&&i[0].setCustomValidity(t.t("orderPicker:notFound"))}),t.validateReq.done(function(t){i.data("qty",t.qty)}),t.validateReq.always(function(){"abort"!==t.validateReq.statusText&&(e.prop("disabled",!1),t.validateReq=null)})}})});