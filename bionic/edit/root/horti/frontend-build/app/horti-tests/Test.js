define(["../i18n","../time","../core/Model"],function(e,t,s){"use strict";return s.extend({urlRoot:"/horti/tests",clientUrlRoot:"#horti/tests",topicPrefix:"horti.tests",privilegePrefix:"HORTI",nlsDomain:"horti-tests",getLabel:function(){return e(this.nlsDomain,"BREADCRUMB:details")},serialize:function(){const e=this.toJSON();return e.duration=t.toString((Date.parse(e.finishedAt)-Date.parse(e.startedAt))/1e3),e.startedAt=t.format(e.startedAt,"L, HH:mm:ss"),e.finishedAt=t.format(e.finishedAt,"L, HH:mm:ss"),e.serialNumbers||(e.serialNumbers=[]),e},serializeRow:function(){const e=this.serialize();e.className=e.result?"success":"danger",e.program=e.program.name||"";const t=e.serialNumbers.length;return t?(e.serialNumbers=e.serialNumbers[0],t>1&&(e.serialNumbers+=` +${t-1}`)):e.serialNumbers="",e}})});