// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["app/broker","app/core/Viewport"],function(e,r){"use strict";var t=new r({el:document.body,selector:"#app-viewport"});return e.subscribe("router.executing",function(){window.scrollTo(0,0)}),window.viewport=t,Object.defineProperty(window,"page",{get:function(){return t.currentPage}}),Object.defineProperty(window,"dialog",{get:function(){return t.currentDialog}}),Object.defineProperty(window,"model",{get:function(){var e=t.currentDialog||t.currentPage;return e&&e.model||e.collection}}),t});