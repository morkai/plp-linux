// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../broker","../socket","../controller","../core/Model","../snf-programs/Program","../snf-tests/Test"],function(t,e,r,s,n,a,u,i){"use strict";return a.extend({nlsDomain:"dashboard",defaults:{status:"offline",currentTest:null,lastTest:null,currentProgram:null},initialize:function(){this.broker=r.sandbox(),this.update(),this.broker.subscribe("controller.valuesChanged",this.onTagValuesChanged.bind(this))},destroy:function(){this.broker.destroy()},fetch:function(){var t=e.Deferred(),r=this;return s.emit("snf.tests.getData",function(e){var s=e.currentTest?new i(e.currentTest):null,n=e.currentTest?new i(e.currentTest):null;r.set({currentTest:s,lastTest:n}),r.update(),t.resolve()}),t.promise()},isTesting:function(){return null!==this.get("currentTest")},getCurrentProgram:function(){if(this.isTesting())return this.get("currentTest").get("program");var t,e=n.tags.getValue("testKind.1"),r=n.tags.getValue("testKind.2");return t=!0===e&&!1===r?n.tags.getValue("program.30s"):!1===e&&!1===r?n.tags.getValue("program.hrs"):n.tags.getValue("program.tester"),t?new u(t):null},onTagValuesChanged:function(e){t.forEach(e,this.updateState,this)},updateState:function(t,e){switch(e){case"masters.controlProcess":this.updateStatus();break;case"program.30s":case"program.hrs":case"program.tester":case"testKind.1":case"testKind.2":this.updateCurrentProgram()}},update:function(){this.updateStatus(),this.updateCurrentProgram()},updateStatus:function(){var t="offline";n.tags.getValue("masters.controlProcess")&&(t=this.isTesting()?"testing":"online"),this.set("status",t)},updateCurrentProgram:function(){var e=this.get("currentProgram")||null,r=this.getCurrentProgram()||null;r&&e&&t.isEqual(e.attributes,r.attributes)||this.set("currentProgram",r)}})});