// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["../i18n","../time","../core/Model","../snf-programs/Program"],function(t,e,r,s){"use strict";return r.extend({urlRoot:"/snf/tests",clientUrlRoot:"#tests",topicPrefix:"snf.tests",privilegePrefix:"SNF",nlsDomain:"snf-tests",initialize:function(){var t=this.get("program");!t||t instanceof s||this.set("program",new s(t))},getLabel:function(){return t(this.nlsDomain,"BREADCRUMBS:details")},serialize:function(){var t=this.toJSON();return t.duration=e.toString((Date.parse(t.finishedAt)-Date.parse(t.startedAt))/1e3),t.startedAt=e.format(t.startedAt,"L, HH:mm:ss"),t.finishedAt=e.format(t.finishedAt,"L, HH:mm:ss"),t.program=(t.program.toJSON?t.program.toJSON():t.program).name,t.orderNo=t.orderNo||"",t.serialNo=t.serialNo||"",t},serializeRow:function(){var t=this.serialize();return t.className=t.result?"success":"danger",t}})});