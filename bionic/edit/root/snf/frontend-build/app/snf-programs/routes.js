// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["app/router","app/viewport","app/user","app/core/pages/FilteredListPage","./Program","./ProgramCollection","app/snf-programs/pages/DetailsPage","app/snf-programs/views/FilterView","app/snf-programs/views/ListView","i18n!app/nls/snf-programs"],function(e,a,r,p,i,s,o,n,t){"use strict";var g=r.auth("LOCAL","USER");e.map("/programs",g,function(e){a.showPage(new p({FilterView:n,ListView:t,actions:[],collection:new s(null,{rqlQuery:e.rql})}))}),e.map("/programs/:id",g,function(e){a.showPage(new o({model:new i({_id:e.params.id})}))})});