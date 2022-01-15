define(["app/core/SocketSandbox"],function(t){"use strict";function o(t){this.sio=t}return o.prototype.sandbox=function(){return new t(this)},o.prototype.getId=function(){return this.sio.id||null},o.prototype.isConnected=function(){return"open"===this.sio.io.readyState},o.prototype.isConnecting=function(){return"opening"===this.sio.io.readyState},o.prototype.connect=function(){this.sio.open()},o.prototype.reconnect=function(){this.connect()},o.prototype.on=function(t,o){return this.sio.on(t,o),this},o.prototype.off=function(t,o){return void 0===o?this.sio.removeAllListeners(t):this.sio.off(t,o),this},o.prototype.emit=function(){return this.sio.json.emit.apply(this.sio.json,arguments),this},o.prototype.send=function(t,o){return this.sio.json.send(t,o),this},o});