define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,i,u){return r.c(n,t),n[t]in u?u[n[t]]:(t=r.lc[i](n[t]-e),t in u?u[t]:u.other)},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{"BREADCRUMBS:base":function(n){return"Diagnostyka"},"BREADCRUMBS:tags":function(n){return"Tagi"},TAGS_HEADER_NAME:function(n){return"Nazwa"},TAGS_HEADER_DESCRIPTION:function(n){return"Opis"},TAGS_HEADER_MASTER:function(n){return"Urządzenie"},TAGS_HEADER_VALUE:function(n){return"Aktualna wartość"},TAGS_HEADER_UNIT:function(n){return"Jednostka"},TAGS_HEADER_TYPE:function(n){return"Typ"},TAGS_HEADER_KIND:function(n){return"Rodzaj"},TAGS_HEADER_ADDRESS:function(n){return"Adres"},TAG_WRITE_FAILED:function(n){return"Nie udało się zmienić <em>"+r.v(n,"tag")+"</em>: <em>"+r.v(n,"reason")+"</em>."},TAG_WRITE_NO_PERM:function(n){return"brak uprawnień"},TAG_WRITE_INVALID_VALUE:function(n){return"nieprawidłowa wartość"},TAG_WRITE_UNKNOWN:function(n){return"nieznany tag"},TAG_WRITE_NOT_WRITABLE:function(n){return"zmiana niemożliwa"},TAG_WRITE_ILLEGAL:function(n){return"zmiana niedozwolona"},TAG_WRITE_UNSUPPORTED:function(n){return"zmiana nie wspierana"},TAG_WRITE_NO_BIT_MASK:function(n){return"brak maski bitowej"},TAG_WRITE_NO_REFERENCE_TAG:function(n){return"brak taga referencyjnego"},TAG_WRITE_UNKNOWN_REFERENCE_TAG:function(n){return"nieznany tag referencyjny"}}});