define(["require","underscore","app/i18n","app/user","app/time","app/viewport","app/data/localStorage","app/data/loadedModules","app/core/View"],function(t,e,a,i,n,s,o,r,l){"use strict";var c=l.extend({nlsDomain:"core",localTopics:{"router.executing":function(t){this.activateNavItem(t.req.path)},"socket.connected":function(){this.setConnectionStatus("online")},"socket.connecting":function(){this.setConnectionStatus("connecting")},"socket.connectFailed":function(){this.setConnectionStatus("offline")},"socket.disconnected":function(){this.setConnectionStatus("offline")},"viewport.page.shown":function(){this.collapse()},"viewport.dialog.shown":function(){this.collapse()}},events:{"shown.bs.collapse":function(){this.broker.publish("navbar.shown")},"hidden.bs.collapse":function(){this.broker.publish("navbar.hidden")},"click .disabled a":function(t){t.preventDefault()},"click .navbar-account-locale":function(t){t.preventDefault(),this.changeLocale(t.currentTarget.getAttribute("data-locale"))},"click .navbar-account-logIn":function(t){t.preventDefault(),this.trigger("logIn")},"click .navbar-account-logOut":function(t){t.preventDefault(),this.trigger("logOut")},"mouseup .btn[data-href]":function(t){if(2!==t.button){var e=t.currentTarget.dataset.href,a=t.currentTarget.dataset.target;return t.ctrlKey||1===t.button||a&&"_self"!==a?window.open(e,a):window.location.href=e,document.body.click(),!1}},"click a[data-group]":function(t){return this.toggleGroup(t.currentTarget.dataset.group),t.currentTarget.blur(),!1}}});return c.DEFAULT_OPTIONS={currentPath:"/",activeItemClassName:"active",offlineStatusClassName:"navbar-status-offline",onlineStatusClassName:"navbar-status-online",connectingStatusClassName:"navbar-status-connecting",loadedModules:{}},c.prototype.initialize=function(){e.defaults(this.options,c.DEFAULT_OPTIONS),this.activeModuleName=null,this.navItems=null,this.$activeNavItem=null,this.initialPath=this.options.currentPath},c.prototype.beforeRender=function(){this.navItems=null,this.$activeNavItem=null},c.prototype.afterRender=function(){this.broker.publish("navbar.render",{view:this}),null!==this.initialPath?(this.activateNavItem(this.initialPath),this.initialPath=null):this.selectActiveNavItem(),this.setConnectionStatus(this.socket.isConnected()?"online":"offline"),this.hideNotAllowedEntries(),this.hideEmptyEntries(),this.toggleGroups(),this.broker.publish("navbar.rendered",{view:this})},c.prototype.activateNavItem=function(t){this.navItems||this.cacheNavItems();for(var e=t.substring(1).match(/^([a-zA-Z0-9\/\-_]+)/),a=this.getNavItemKeysFromPath(e?e[1]:""),i="",n=a.length-1;n>=0;--n){var s=a[n];if(this.navItems[s]){i=s;break}}i!==this.activeModuleName&&(this.activeModuleName=i,this.selectActiveNavItem())},c.prototype.changeLocale=function(t){a.reload(t)},c.prototype.setConnectionStatus=function(t){if(this.isRendered()){var e=this.$(".navbar-account-status");e.removeClass(this.options.offlineStatusClassName).removeClass(this.options.onlineStatusClassName).removeClass(this.options.connectingStatusClassName),e.addClass(this.options[t+"StatusClassName"]),this.toggleConnectionStatusEntries("online"===t)}},c.prototype.getModuleNameFromLi=function(t,e,a){var i=t.dataset[a?"clientModule":"module"];if(void 0===i&&!e)return"";if(i)return i;var n=t.querySelector("a");if(!n)return"";var s=n.getAttribute("href");return s?this.getModuleNameFromPath(s):""},c.prototype.getModuleNameFromPath=function(t){if("/"!==t[0]&&"#"!==t[0]||(t=t.substr(1)),""===t)return"";var e=t.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);return e?e[1]:""},c.prototype.selectActiveNavItem=function(){if(this.isRendered()){this.navItems||this.cacheNavItems();var t=this.options.activeItemClassName;null!==this.$activeNavItem&&this.$activeNavItem.removeClass(t);var e=this.navItems[this.activeModuleName];!e&&s.currentPage&&s.currentPage.navbarModuleName&&(e=this.navItems[s.currentPage.navbarModuleName]),e?(e.addClass(t),this.$activeNavItem=e):this.$activeNavItem=null}},c.prototype.cacheNavItems=function(){var t=this;t.navItems={},t.$(".nav > li").each(function(){t.cacheNavItem(this)})},c.prototype.cacheNavItem=function(t){var e=this,a=e.$(t);a.hasClass(e.options.activeItemClassName)&&(e.$activeNavItem=a);var i=a.find("a").first().attr("href");i&&"#"===i.charAt(0)?e.getNavItemKeysFromLi(a[0]).forEach(function(t){e.navItems[t]||(e.navItems[t]=a)}):a.hasClass("dropdown")&&a.find(".dropdown-menu > li").each(function(){e.getNavItemKeysFromLi(this).forEach(function(t){e.navItems[t]||(e.navItems[t]=a)})})},c.prototype.getNavItemKeysFromLi=function(t){var e=t.querySelector("a");if(!e)return[""];var a=t.dataset.navPath;if(a)a=a.split(" ");else{var i=e.getAttribute("href");if(!i||"/"!==i.charAt(0)&&"#"!==i.charAt(0))return[""];a=[i.substring(1)]}var n=[];return a.forEach(function(t){var e=t.match(/^([a-zA-Z0-9\/\-_]+)/);e&&(n=n.concat(this.getNavItemKeysFromPath(e[1])))},this),n.length||n.push(""),n},c.prototype.getNavItemKeysFromPath=function(t){var e=[];return t.split("/").forEach(function(t,a){e[a-1]&&(t=e[a-1]+"/"+t),e.push(t)}),e},c.prototype.hideNotAllowedEntries=function(){var t=this,a=i.isLoggedIn(),n=[],s=[];function o(t){return t.hasClass("divider")?(s.push(t),!0):!!t.hasClass("dropdown-header")&&(n.push(t),!0)}function r(n){if(window.NAVBAR_ITEMS&&!1===window.NAVBAR_ITEMS[n.attr("data-item")])return!1;var s=n.attr("data-loggedin");if("string"==typeof s&&(s="0"!==s)!==a)return!1;var o=t.getModuleNameFromLi(n[0],!1);if(""!==o&&void 0===n.attr("data-no-module")&&e.some(o.split(" "),function(e){return!t.options.loadedModules[e]}))return!1;var r=n.attr("data-privilege");return void 0===r||i.isAllowedTo.apply(i,r.split(" "))}this.$(".navbar-nav > li").each(function(){var e=t.$(this);o(e)||(e[0].style.display=r(e)&&function t(e){if(!e.hasClass("dropdown"))return!0;var a=!0;e.find("> .dropdown-menu > li").each(function(){var i=e.find(this);if(!o(i)){var n=r(i)&&t(i);i[0].style.display=n?"":"none",a=a||n}});return a}(e)?"":"none")}),n.forEach(function(e){e[0].style.display=t.hasVisibleSiblings(e,"next")?"":"none"}),s.forEach(function(e){e[0].style.display=t.hasVisibleSiblings(e,"prev")&&t.hasVisibleSiblings(e,"next")?"":"none"}),this.$(".btn[data-privilege]").each(function(){this.style.display=i.isAllowedTo.apply(i,this.dataset.privilege.split(" "))?"":"none"})},c.prototype.hasVisibleSiblings=function(t,e){var a=t[e+"All"]().filter(function(){return"none"!==this.style.display});return!!a.length&&!a.first().hasClass("divider")},c.prototype.hideEmptyEntries=function(){var t=this;this.$(".dropdown > .dropdown-menu").each(function(){var e=t.$(this),a=!1;e.children().each(function(){a=a||"none"!==this.style.display}),a||(e.parent()[0].style.display="none")})},c.prototype.toggleConnectionStatusEntries=function(t){var e=this;this.$("li[data-online]").each(function(){var a=e.$(this);if(void 0!==a.attr("data-disabled"))return a.addClass("disabled");switch(a.attr("data-online")){case"show":a[0].style.display=t?"":"none";break;case"hide":a[0].style.display=t?"none":"";break;default:a[t?"removeClass":"addClass"]("disabled")}})},c.prototype.toggleGroups=function(){var t=this,a=JSON.parse(o.getItem("WMES_NAVBAR_GROUPS")||"{}"),n={};t.$("a[data-group]").each(function(){var t=this.dataset.group.split("/")[0];n[t]||(n[t]=[]),!this.dataset.privilege||i.isAllowedTo.apply(i,this.dataset.privilege.split(" "))?(n[t].push(this.dataset.group),a[t]||(a[t]=this.dataset.group)):this.parentNode.removeChild(this)}),Object.keys(a).forEach(function(i){var s=n[i];e.isEmpty(s)||(a[i]&&-1!==s.indexOf(a[i])||(a[i]=s[0]),t.toggleGroup(a[i]))})},c.prototype.toggleGroup=function(t){var e=t.split("/");this.$('a[data-group^="'+e[0]+'"]').each(function(){this.classList.toggle("active",this.dataset.group===t)}),this.$('li[data-group^="'+e[0]+'"]').each(function(){this.classList.toggle("navbar-group-hidden",this.dataset.group!==t)});var a=JSON.parse(o.getItem("WMES_NAVBAR_GROUPS")||"{}");a[e[0]]=t,o.setItem("WMES_NAVBAR_GROUPS",JSON.stringify(a))},c.prototype.collapse=function(){this.$(".navbar-collapse.in").length&&this.$(".navbar-toggle").click()},c});