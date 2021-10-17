define(["underscore","jquery","app/i18n","app/broker","app/viewport"],function(t,e,i,n,o){"use strict";return function(s,a,r){"string"==typeof a&&(r=a,a=null),a=t.assign({format:"A4",orientation:"portrait"},a);var p=o.msg.show({type:"info",text:'<i class="fa fa-spinner fa-spin"></i><span>'+i("core","html2pdf:progress")+"</span>"}),f=e.ajax({method:"POST",url:"/html2pdf?format="+a.format+"&orientation="+a.orientation,contentType:"text/plain",data:s});f.done(function(s){"string"==typeof r&&/^[a-f0-9]{24}$/.test(r)?function(t,s,a,r){o.msg.hide(t),t=o.msg.show({type:"info",text:'<i class="fa fa-spinner fa-spin"></i><span>'+i("core","html2pdf:printing")+"</span>"});var p=e.ajax({method:"POST",url:"/html2pdf;print",data:JSON.stringify({hash:r,printer:a})});p.done(function(){o.msg.hide(t,!0),o.msg.show({type:"success",time:2e3,text:i("core","html2pdf:printing:success")})}),p.fail(function(){o.msg.hide(t,!0),o.msg.show({type:"error",time:2500,text:i("core","html2pdf:printing:failure")})}),p.always(function(){n.publish("html2pdf.completed"),s.done&&s.done()})}(p,a,r,s.hash):function(e,s,a){var r=Math.min(window.screen.availWidth-200,1400),p=t.assign({top:80,width:r,height:Math.min(window.screen.availHeight-160,800),left:window.screen.availWidth-r-80},t.pick(s,["top","left","width","height"])),f=[];Object.keys(p).forEach(function(t){f.push(t+"="+p[t])});var h="/html2pdf/"+a;s.filename&&(h+="/"+s.filename);h+=".pdf";var d=window.open(h,"_blank",f.join(","));d?(o.msg.hide(e),d.focus()):(o.msg.hide(e,!0),o.msg.show({type:"error",time:3e3,text:i("core","MSG:POPUP_BLOCKED")}));n.publish("html2pdf.completed"),s.done&&s.done()}(p,a,s.hash)}),f.fail(function(){o.msg.hide(p,!0),o.msg.show({type:"error",time:2500,text:i("core","html2pdf:failure")}),n.publish("html2pdf.completed"),a.done&&a.done()})}});