define(["app/nls/locale/pl"],function(r){var n={lc:{pl:function(n){return r(n)},en:function(n){return r(n)}},c:function(r,n){if(!r)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(r,n,e){if(isNaN(r[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return r[n]-(e||0)},v:function(r,e){return n.c(r,e),r[e]},p:function(r,e,t,o,i){return n.c(r,e),r[e]in i?i[r[e]]:(e=n.lc[o](r[e]-t),e in i?i[e]:i.other)},s:function(r,e,t){return n.c(r,e),r[e]in t?t[r[e]]:t.other}};return{"MSG:LOADING_FAILURE":function(r){return"Ładowanie tagów nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(r){return"Ładowanie taga nie powiodło się."},"GROUP:other":function(r){return"Inne"},"GROUP:health":function(r){return"Zdrowie systemu"},"GROUP:masters":function(r){return"Stany połączenia z urządzeniami"},"GROUP:program":function(r){return"Programowanie"},"GROUP:heatChamber":function(r){return"HC: Komory grzewcze"},"SUBGROUP:heatChamber":function(r){return"HC-"+n.v(r,"id")+": Komora grzewcza "+n.v(r,"id")},"GROUP:measureChamber":function(r){return"MC: Komory pomiarowe"},"SUBGROUP:measureChamber":function(r){return"MC-"+n.v(r,"id")+": Komora pomiarowa "+n.v(r,"id")},"GROUP:temp":function(r){return"TC: Regulatory temperatury"},"SUBGROUP:temp":function(r){return"TC-"+n.v(r,"id")+": Regulator temperatury "+n.v(r,"id")}}});