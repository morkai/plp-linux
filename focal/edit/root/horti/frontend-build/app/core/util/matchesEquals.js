define(["underscore"],function(r){"use strict";return function(n,e,i){if(void 0===i)return!0;var t=r.find(n.selector.args,function(r){return("eq"===r.name||"in"===r.name)&&r.args[0]===e});return!t||("eq"===t.name?String(t.args[1])===String(i):Array.isArray(t.args[1])&&-1!==t.args[1].indexOf(i))}});