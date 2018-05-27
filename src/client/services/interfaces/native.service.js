Tw.NativeService = function () {
  this._bridge       = null;
  this._callbackList = [];
  this._callback     = null;
  this._randomCode   = 0;

  this._init();
};

Tw.NativeService.prototype = {
  send: function (command, params, callback) {
    if ( this._bridge ) {
      this._bridge(command, params);
    }
    this._callback = callback;
  },

  _init: function () {
    this._bridge  = Tw.BrowserHelper.isAndroid() ? window.tworld : Tw.BrowserHelper.isIos() ? window.webkit.messageHandlers.tworld : null;
    window._onNativeCallBack = $.proxy(this._onNativeCallBack, this);
  },

  _onNativeCallBack: function (resp) {
    if ( this._callback ) {
      this._callback(resp);
    }
  },

  _getRandomCode: function () {
    this._randomCode++;
    return Tw.FormatHelper.leadingZeros(this._randomCode, 6);
  }
};
