define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,u,e,i){return r.c(n,t),n[t]in i?i[n[t]]:(t=r.lc[e](n[t]-u),t in i?i[t]:i.other)},s:function(n,t,u){return r.c(n,t),n[t]in u?u[n[t]]:u.other}};return{"BREADCRUMBS:browse":function(n){return"Programy"},"PANEL:TITLE:details":function(n){return"Szczegóły programu"},"PANEL:TITLE:gallery":function(n){return"Galeria"},"PROPERTY:name":function(n){return"Nazwa programu"},"PROPERTY:kind":function(n){return"Rodzaj programu"},"PROPERTY:lightSourceType":function(n){return"Typ źródła światła"},"PROPERTY:bulbPower":function(n){return"Moc żarówki"},"PROPERTY:ballast":function(n){return"Balast"},"PROPERTY:ignitron":function(n){return"Ignitron"},"PROPERTY:lightSensors":function(n){return"Czujniki światła aktywne?"},"PROPERTY:lampCount":function(n){return"Ilość lamp"},"PROPERTY:lampBulb":function(n){return"Żarówka w lampie?"},"PROPERTY:waitForStartTime":function(n){return"Czas oczekiwania na zaświecenie"},"PROPERTY:illuminationTime":function(n){return"Czas świecenia"},"PROPERTY:contactors":function(n){return"Styczniki"},"PROPERTY:testerK12":function(n){return"Stycznik testera K12 - 100W"},"PROPERTY:ballast400W1":function(n){return"Stycznik S6 - Balast 1 - 400W"},"PROPERTY:ballast400W2":function(n){return"Stycznik S7 - Balast 2 - 400W"},"PROPERTY:ballast2000W":function(n){return"Stycznik S8 - Balast - 2000W"},"PROPERTY:ignitron400W1":function(n){return"Stycznik S9 - Ignitron 1 - 400W"},"PROPERTY:ignitron400W2":function(n){return"Stycznik S10 - Ignitron 2 - 400W"},"PROPERTY:ignitron2000W":function(n){return"Stycznik S11 - Ignitron - 2000W"},"PROPERTY:k15":function(n){return"Stycznik lampy K15 - 2000W"},"PROPERTY:k16":function(n){return"Stycznik lampy K16 - 1000W"},"PROPERTY:k17":function(n){return"Stycznik lampy K17 - E40 <strong>(1)</strong> LEFT"},"PROPERTY:k18":function(n){return"Stycznik lampy K18 - E40 <strong>(2)</strong> RIGHT"},"PROPERTY:k19":function(n){return"Stycznik lampy K19"},"PROPERTY:k20":function(n){return"Stycznik lampy K20"},"PROPERTY:k21":function(n){return"Stycznik lampy K21"},"PROPERTY:interlock":function(n){return"Blokada"},"PROPERTY:hrsInterval":function(n){return"Czas odstępu HRS"},"PROPERTY:hrsTime":function(n){return"Czas świecenia HRS"},"PROPERTY:hrsCount":function(n){return"Ilość powtórzeń HRS"},"PROPERTY:limitSwitch":function(n){return"Krańcówka w lampie?"},"PROPERTY:currentBoundries":function(n){return"Tolerancja prądu"},"PROPERTY:minCurrent":function(n){return"Prąd minimalny"},"PROPERTY:maxCurrent":function(n){return"Prąd maksymalny"},"PROPERTY:images.label":function(n){return"Etykieta"},"current:noBoundries":function(n){return"Nie sprawdzana"},"current:boundries":function(n){return"od <em>"+r.v(n,"min")+"A</em> do <em>"+r.v(n,"max")+"A</em>"},"kind:30s":function(n){return"30 sekund"},"kind:hrs":function(n){return"Hot Restrike"},"kind:tester":function(n){return"Tester"},"lightSourceType:100":function(n){return"HPI"},"lightSourceType:2x100":function(n){return"HPI x2"},"lightSourceType:400":function(n){return"SON"},"lightSourceType:2x400":function(n){return"SON x2"},"lightSourceType:2000":function(n){return"MNH"},"bulbPower:100":function(n){return"100W"},"bulbPower:2x100":function(n){return"100W x2"},"bulbPower:150":function(n){return"150W"},"bulbPower:250":function(n){return"250W"},"bulbPower:2x250":function(n){return"250W x2"},"bulbPower:400":function(n){return"400W"},"bulbPower:2x400":function(n){return"400W x2"},"bulbPower:600":function(n){return"600W"},"bulbPower:2x600":function(n){return"600W x2"},"bulbPower:1000":function(n){return"1000W"},"bulbPower:2000":function(n){return"2000W"},"ballast:400":function(n){return"400W"},"ballast:2x400":function(n){return"400W x2"},"ballast:2000":function(n){return"2000W"},"ignitron:outside":function(n){return"Na zewnątrz"},"ignitron:fitting":function(n){return"W oprawie"},"ignitron:tin":function(n){return"W puszce"},"lightSensors:true":function(n){return"Włączone"},"lightSensors:false":function(n){return"Wyłączone"},"lampCount:1":function(n){return"Jedna lampa SON/HPI"},"lampCount:2":function(n){return"Dwie lampy SON/HPI"},"lampCount:3":function(n){return"Jedna lampa MNH"},"interlock:1":function(n){return"Podłącz sondę 1"},"interlock:1+2":function(n){return"Wyłącz sondę 2"},"interlock:mnh":function(n){return"Podłącz sondę MNH"},"gallery:add":function(n){return"Dodaj nowe obrazy!"},"gallery:delete:title":function(n){return"Usuwanie obrazu"},"gallery:delete:message":function(n){return"Czy na pewno chcesz usunąć wybrany obraz?"},"gallery:delete:yes":function(n){return"Usuń obraz"},"gallery:delete:no":function(n){return"Anuluj"},"gallery:edit:title":function(n){return"Edycja obrazu"},"gallery:edit:submit":function(n){return"Edytuj obraz"},"gallery:edit:failure":function(n){return"Nie udało się zmienić etykiety."}}});