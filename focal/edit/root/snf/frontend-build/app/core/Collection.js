// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","backbone","h5.rql/index","./util","./PaginationData"],function(t,i,e,r,o){"use strict";function n(e,r){t.isObject(r)||(r={}),this.rqlQuery=this.createRqlQuery(r.rqlQuery||this.rqlQuery),-1337===this.rqlQuery.limit&&(this.rqlQuery.limit=this.getDefaultPageLimit()),this.paginationData=!1!==r.paginate&&!1!==this.paginate?new o:null,this.url||(this.url=this.model.prototype.urlRoot),i.Collection.call(this,e,r),this.paginationData&&this.listenTo(this.paginationData,"change:page",this.onPageChanged)}return r.inherits(n,i.Collection),n.prototype.parse=function(t){return this.paginationData&&this.paginationData.set(this.getPaginationData(t)),Array.isArray(t.collection)?t.collection:[]},n.prototype.sync=function(t,e,r){return"read"!==t||r.data||(r.data=this.rqlQuery.toString()),i.Collection.prototype.sync.call(this,t,e,r)},n.prototype.genClientUrl=function(t){if(null===this.model.prototype.clientUrlRoot)throw new Error("Model's `clientUrlRoot` was not specified");var i=this.model.prototype.clientUrlRoot;return"string"==typeof t&&(i+=";"+t),i},n.prototype.getTopicPrefix=function(){return this.topicPrefix||this.model.prototype.topicPrefix},n.prototype.getPrivilegePrefix=function(){return this.privilegePrefix||this.model.prototype.privilegePrefix},n.prototype.getNlsDomain=function(){return this.nlsDomain||this.model.prototype.nlsDomain},n.prototype.getLabel=function(t){var i=this.get(t);return i?i.getLabel():null},n.prototype.createRqlQuery=function(i){return t.isString(i)?i=e.parse(i):t.isFunction(i)?i=i.call(this,e):t.isObject(i)&&(i=e.Query.fromObject(i)),i&&!i.isEmpty()?i:t.isString(this.rqlQuery)?e.parse(this.rqlQuery):t.isFunction(this.rqlQuery)?this.rqlQuery.call(this,e):t.isObject(this.rqlQuery)?e.Query.fromObject(this.rqlQuery):new e.Query},n.prototype.getPaginationData=function(t){return{totalCount:t.totalCount,urlTemplate:this.genPaginationUrlTemplate(),skip:this.rqlQuery.skip,limit:this.rqlQuery.limit}},n.prototype.genPaginationUrlTemplate=function(){var t=this.rqlQuery,i=t.skip,e=t.limit;t.skip="${skip}",t.limit="${limit}";var r=this.genClientUrl()+"?"+t.toString();return t.skip=i,t.limit=e,r},n.prototype.onPageChanged=function(t,i){this.rqlQuery.skip=(i-1)*this.rqlQuery.limit,this.fetch({reset:!0})},n.prototype.getDefaultPageLimit=function(){var t=32,i=34;t=this.theadHeight>8?this.theadHeight:32+20*((this.theadHeight||1)-1),"number"==typeof this.rowHeight?i=this.rowHeight>8?this.rowHeight:31+20*(this.rowHeight-1):!1===this.rowHeight&&(i=31);var e=window.innerHeight-99-106-54-t;return Math.max(10,Math.floor(e/i))},n});