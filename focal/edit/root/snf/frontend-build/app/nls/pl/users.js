define(["app/nls/locale/pl"],function(n){var o={lc:{pl:function(o){return n(o)},en:function(o){return n(o)}},c:function(n,o){if(!n)throw new Error("MessageFormat: Data required for '"+o+"'.")},n:function(n,o,e){if(isNaN(n[o]))throw new Error("MessageFormat: '"+o+"' isn't a number.");return n[o]-(e||0)},v:function(n,e){return o.c(n,e),n[e]},p:function(n,e,i,r,t){return o.c(n,e),n[e]in t?t[n[e]]:(e=o.lc[r](n[e]-i),e in t?t[e]:t.other)},s:function(n,e,i){return o.c(n,e),n[e]in i?i[n[e]]:i.other}};return{"breadcrumbs:logIn":function(n){return"Logowanie do systemu"},"select2:placeholder":function(n){return"Szukaj po nazwisku..."},"select2:users:system":function(n){return"System"},"LOG_IN_FORM:TITLE:LOG_IN":function(n){return"Logowanie do systemu"},"LOG_IN_FORM:TITLE:RESET":function(n){return"Resetowanie hasła"},"LOG_IN_FORM:LABEL:LOGIN":function(n){return"Login"},"LOG_IN_FORM:LABEL:PASSWORD":function(n){return"Hasło"},"LOG_IN_FORM:LABEL:NEW_PASSWORD":function(n){return"Nowe hasło"},"LOG_IN_FORM:LABEL:NEW_PASSWORD2":function(n){return"Potwierdź nowe hasło"},"LOG_IN_FORM:SUBMIT:LOG_IN":function(n){return"Zaloguj się"},"LOG_IN_FORM:SUBMIT:RESET":function(n){return"Resetuj hasło"},"LOG_IN_FORM:LINK:LOG_IN":function(n){return"Zaloguj się"},"LOG_IN_FORM:LINK:RESET":function(n){return"Zapomniałeś hasła?"},"LOG_IN_FORM:LINK:OFFICE365":function(n){return"Zaloguj się za pomocą konta "+o.v(n,"OFFICE365_TENANT")},"LOG_IN_FORM:RESET:SUBJECT":function(n){return"["+o.v(n,"APP_NAME")+"] Reset hasła"},"LOG_IN_FORM:RESET:TEXT":function(n){return"Otrzymaliśmy żądanie zresetowania hasła do Twojego konta w systemie "+o.v(n,"APP_NAME")+".\n\nAby potwierdzić zmianę hasła, kliknij poniższy odnośnik:\n"+o.v(n,"resetUrl")+"\n\nOdnośnik aktywny będzie tylko przez 24 godziny. Po tym czasie możesz wygenerować nowe żądanie wchodząc do systemu: "+o.v(n,"appUrl")+"\n\nJeżeli nie chcesz zmianiać swojego hasła, zignoruj tego e-maila.\n\nW razie jakichkolwiek problemów skonsultuj się ze swoim przełożonym lub administratorem systemu."},"LOG_IN_FORM:RESET:MSG:FAILURE":function(n){return"Nie udało się zresetować hasła."},"LOG_IN_FORM:RESET:MSG:SUCCESS":function(n){return"Sprawdź swojego e-maila!"},"LOG_IN_FORM:MSG:NOT_FOUND":function(n){return"Użytkownik o podanym loginie nie istnieje."},"LOG_IN_FORM:MSG:INVALID_EMAIL":function(n){return"Użytkownik nie ma ustawionego adresu e-mail."},"LOG_IN_FORM:MSG:MANY_MATCHES":function(n){return"Znaleziono wielu użytkowników pasujących do podanego loginu!"},"LOG_IN_FORM:UNKNOWN":function(n){return"Nierozpoznany login!"},"LOG_IN_FORM:UNSAFE_PASSWORD":function(n){return"<p>Nie możesz się zalogować, ponieważ Twoje hasło jest takie samo jak login lub numer kadrowy.</p><p>Skorzystaj z poniższego formularza, aby ustawić nowe hasło dla Twojego konta. Przed użyciem nowego hasła musisz je aktywować klikając na odnośnik wysłany na adres e-mail przypisany do Twojego konta.</p><p>W razie problemów poinformuj swojego przełożonego.</p>"},"LOG_IN_FORM:PASSWORD_MISMATCH":function(n){return"Podane hasła nie pasują do siebie."}}});