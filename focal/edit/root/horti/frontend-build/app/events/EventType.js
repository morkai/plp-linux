define(["../core/Model"],function(t){"use strict";return t.extend({urlRoot:"/events/types",clientUrlRoot:"#events/types",nlsDomain:"events",labelAttribute:"text",defaults:{text:null},toSelect2Option:function(){return{id:this.id,text:this.getLabel()}}})});