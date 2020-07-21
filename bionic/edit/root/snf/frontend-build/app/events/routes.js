// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user","i18n!app/nls/events"],function(e,n,t){"use strict";e.map("/events",t.auth("EVENTS:VIEW"),function(e){n.loadPage("app/events/pages/EventListPage",function(n){return new n({rql:e.rql})})})});