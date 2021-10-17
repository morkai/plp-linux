define(["underscore","jquery","backbone","bootstrap","select2"],function(t,o,e){"use strict";var n=e.sync;e.sync=function(t,o,e){return e.syncMethod=t,n.call(this,t,o,e)},o.fn.modal.Constructor.prototype.enforceFocus=function(){},o.fn.modal.Constructor.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",o.proxy(function(t){27!==t.which||this.$element.hasClass("modal-no-keyboard")||this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},o.fn.modal.Constructor.prototype.backdrop=function(t){var e=this,n=e.$element.hasClass("fade")?"fade":"";if(e.isShown&&e.options.backdrop){var s=o.support.transition&&n;if(e.$backdrop=o('<div class="modal-backdrop '+n+'" />').prependTo(e.$element).on("click.dismiss.bs.modal",function(t){t.target===t.currentTarget&&("static"===e.options.backdrop||e.$element.hasClass("modal-static")?e.$element[0].focus.call(e.$element[0]):e.hide.call(e))}),s&&e.$backdrop[0].offsetWidth,e.$backdrop.addClass("in"),!t)return;s?this.$backdrop.one("bsTransitionEnd",t).emulateTransitionEnd(o.fn.modal.Constructor.BACKDROP_TRANSITION_DURATION):t()}else if(!e.isShown&&e.$backdrop){e.$backdrop.removeClass("in");var i=function(){e.removeBackdrop(),t&&t()};o.support.transition&&e.$element.hasClass("fade")?e.$backdrop.one("bsTransitionEnd",i).emulateTransitionEnd(o.fn.modal.Constructor.BACKDROP_TRANSITION_DURATION):i()}else t&&t()},o.fn.modal.Constructor.prototype.checkScrollbar=function(){this.bodyIsOverflowing=document.body.scrollHeight>document.documentElement.clientHeight||"scroll"===o(document.body).css("overflow-y"),this.scrollbarWidth=this.measureScrollbar()},o.fn.popover.Constructor.prototype.hasContent=function(){return"function"==typeof this.options.hasContent?!!this.options.hasContent.call(this.$element[0]):"boolean"==typeof this.options.hasContent?this.options.hasContent:!!this.getTitle()||!!this.getContent()},o.fn.popover.Constructor.prototype.tip=function(){if(this.$tip)return this.$tip;var t=this.options,e=t.template;return"function"==typeof e&&(e=e.call(this.$element[0],o.fn.popover.Constructor.DEFAULTS.template)),this.$tip="string"==typeof e?o(e):e,t.css&&this.$tip.css(t.css),t.contentCss&&this.$tip.find(".popover-content").first().css(t.contentCss),t.className&&("function"==typeof t.className?this.$tip.addClass(t.className(this)):this.$tip.addClass(t.className)),this.$tip},o.fn.popover.Constructor.prototype.getTitle=function(){var t=this.$element,o=this.options;return o.title?"function"==typeof o.title?o.title.call(t[0]):o.title:t.attr("data-original-title")||""};var s=o(document.body);return o.fn.select2.defaults.dropdownContainer=function(t){var o=t.container.closest(".modal-body");if(0===o.length)return s;var e=o.closest(".modal-dialog");return 0===e.length?s:e},s.on("click","label[for]",function(t){var e=o("#"+t.currentTarget.htmlFor),n=e.data("select2");n&&n.isInterfaceEnabled()&&!e.parent().hasClass("has-required-select2")&&e.select2("focus")}),{}});