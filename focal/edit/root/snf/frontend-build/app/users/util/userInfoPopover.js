// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/pubsub","app/time","app/data/prodFunctions","app/data/companies","app/users/templates/userInfoPopover"],function(e,n,o,t,r,u,a){"use strict";function l(){v=o.subscribe("users.edited",function(n){var o=n.model;null===f[o._id]&&(f[o._id]={}),f[o._id]&&e.assign(f[o._id],e.pick(o,Object.keys(d)))})}function i(e,o){null===v&&l(),e.style.cursor="wait",f[o]=null;var t=n.ajax({url:"/users?_id="+o+"&limit(1)&select("+d.join(",")+")"});t.always(function(){e.style.cursor=""}),t.done(function(n){1===n.totalCount&&(f[o]=n.collection[0],T===o&&s(e,o,!0))})}function s(e,o,t){if(!b||b[0]!==e){null===N&&(N=n(".navbar").find('a[href^="#users"]').length>0),p(),T=o;var l=f[o],i=r.get(l.prodFunction),s=u.get(l.company),m=c(l.mobile);if(m&&(/^\+48[0-9]{9}$/.test(m.number)?m.label=m.number.substr(3,3)+" "+m.number.substr(6,3)+" "+m.number.substr(9,3):m.label=m.number),I||(I=n(n.fn.popover.Constructor.DEFAULTS.template).addClass("userInfoPopover")[0].outerHTML),b=n(e).popover({placement:"top",container:e.parentNode,trigger:"manual",html:!0,content:a({linkToDetails:N,userInfo:{_id:l._id,name:l.firstName&&l.lastName?l.firstName+" "+l.lastName:l.login,personnelId:l.personellId,position:l.kdPosition||(i?i.getLabel():null),company:s?s.getLabel():l.company,email:l.email,mobile:m}}),template:I}),b.data("userId",l._id),b.on("click.userInfoPopover",function(e){if("0"!==e.currentTarget.dataset.clickable)return y?y=!1:p(),!1}),g&&clearTimeout(g),t)return void b.popover("show");g=setTimeout(function(){b&&b.data("userId")===T&&b.popover("show")},200)}}function p(){T=null,y=!0,g&&(clearTimeout(g),g=null),b&&(b.off(".userInfoPopover"),b.popover("destroy"),b=null,n(".userInfoPopover").remove())}function c(n){var o=m(t.format(Date.now(),"HH:mm")).value;return e.find(n,function(e){var n=m(e.fromTime),t=m("00:00"===e.toTime?"24:00":e.toTime);return t.value<n.value?o<t.value||o>=n.value:n.value<t.value&&(o>=n.value&&o<t.value)})}function m(e){var n=e.split(":"),o=parseInt(n[0],10),t=parseInt(n[1],10);return{hours:o,minutes:t,value:1e3*o+t}}var d=["firstName","lastName","login","personellId","email","mobile","prodFunction","company","kdPosition","presence"],f={},v=null,b=null,I=null,g=null,T=null,y=!0,N=null;n(document.body).on("click",function(e){if(b)return n(e.target).closest(".popover").length?void setTimeout(p,1):void p()}).on("mouseenter",".userInfo-label",function(e){var n=e.currentTarget.parentNode,o=n.dataset.userId;if(o){if(T=o,f[o])return s(n,o);null!==f[o]&&i(n,o)}}).on("mouseleave",".userInfo-label",function(e){if(y)return void p();e.currentTarget.parentNode.dataset.userId!==T&&(y=!0,p())})});