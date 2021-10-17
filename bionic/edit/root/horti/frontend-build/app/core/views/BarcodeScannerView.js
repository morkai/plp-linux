define(["require","app/viewport","../View","app/core/templates/barcodeScanner","css!app/core/assets/barcodeScanner"],function(e,n,s,t){"use strict";return s.extend({dialogClassName:"barcodeScanner-modal",template:t,events:{click:function(){n.closeDialog()}},destroy:function(){this.scanner&&(this.scanner.stop(),this.scanner=null)},onDialogShown:function(){this.loadDependencies()},loadDependencies:function(){e(["html5-qrcode"],this.onDependencyLoadSuccess.bind(this),this.onDependencyLoadFailure.bind(this))},onDependencyLoadSuccess:function(e){this.scanner=new e.Html5Qrcode(this.idPrefix+"-scanner",{experimentalFeatures:{useBarCodeDetectorIfSupported:!0,formatsToSupport:this.options.formatsToSupport||[e.Html5QrcodeSupportedFormats.QR_CODE]}});var n=Object.assign({facingMode:"environment"},this.options.cameraConfig),s=Object.assign({fps:10,qrbox:250,aspectRatio:1},this.options.scanConfig);this.scanner.start(n,s,this.onScanSuccess.bind(this))},onDependencyLoadFailure:function(e){this.$id("scanner").html('<p class="barcodeScanner-error"></p>').text(e.message)},onScanSuccess:function(e,n){this.trigger("success",e,n)}})});