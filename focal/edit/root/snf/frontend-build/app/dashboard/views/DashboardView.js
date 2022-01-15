// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/viewport","app/i18n","app/user","app/controller","app/data/programs","app/core/View","app/dashboard/templates/dashboard"],function(t,e,a,i,s,o,r,n,d){"use strict";function h(t){return(100*t/255).toFixed(2)+"%"}function p(t){for(var e=t.getImageData(0,0,t.canvas.width,t.canvas.height),a=e.data,i=0,s=a.length;i<s;i+=4){var o=.3*a[i]+.5*a[i+1]+.15*a[i+2];a[i]=o,a[i+1]=o,a[i+2]=o}t.putImageData(e,0,0)}navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia;var c;return n.extend({template:d,localTopics:{"controller.valuesChanged":function(e){t.forEach(e,this.updateState,this)}},initialize:function(){this.idPrefix=t.uniqueId("dashboard")},destroy:function(){this.context=null},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){s.data.local?this.setUpCamera():this.$id("camera").remove()},updateState:function(t,e){},setUpCamera:function(){navigator.getUserMedia&&(void 0===c?navigator.getUserMedia({video:!0,audio:!1},this.onCameraSuccess.bind(this),this.onCameraError.bind(this)):null!==c&&this.setUpVideo())},onCameraSuccess:function(t){c=t,this.setUpVideo()},onCameraError:function(t){c=null,a.msg.show({type:"error",time:5e3,text:"[CAMERA:"+t.name+"]"+(t.message.length?" "+t.message:"")})},setUpVideo:function(){var t=this.$id("video"),a=this.$id("snapshot"),i=parseInt(t.prop("width"),10),s=parseInt(t.prop("height"),10);a.prop("width",i),a.prop("height",s),t.prop("src",window.URL.createObjectURL(c)),a.on("mousemove",this.onSnapshotMouseMove.bind(this)),this.$id("control").click(function(){var a=e(this.querySelector(".fa"));a.hasClass("fa-play")?(a.removeClass("fa-play").addClass("fa-pause"),t[0].play()):(a.removeClass("fa-pause").addClass("fa-play"),t[0].pause())}),this.context=a[0].getContext("2d"),this.timers.snapshot=setInterval(function(e){e.context.drawImage(t[0],0,0,i,s),e.$id("grayscale").hasClass("active")&&p(e.context)},200,this)},onSnapshotMouseMove:function(t){var e=this.context.getImageData(t.offsetX,t.offsetY,1,1).data,a=e[0],i=e[1],s=e[2];this.$id("camera").css("background-color","rgb("+a+","+i+","+s+")");var o=.2126*a+.7152*i+.0722*s,r=.299*a+.587*i+.114*s,n=Math.sqrt(.241*Math.pow(a,2)+.691*Math.pow(i,2)+.068*Math.pow(s,2));this.$id("lum1").text(o.toFixed(2)+" -> "+h(o)),this.$id("lum2").text(r.toFixed(2)+" -> "+h(r)),this.$id("lum3").text(n.toFixed(2)+" -> "+h(n)),this.$(".dashboard-lums").css("color",o>99?"#000":"#fff")}})});