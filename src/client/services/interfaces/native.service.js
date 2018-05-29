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
      var parameter = {
        command: command,
        callback: 'onNativeCallback',
        params: params
      }
      if(Tw.BrowserHelper.isAndroid) {
        parameter = JSON.stringify(parameter)
      }
      this._bridge(parameter);
    }
    this._callback = callback;
  },

  _init: function () {
    this._bridge  = Tw.BrowserHelper.isAndroid() ? window.tworld : Tw.BrowserHelper.isIos() ? window.webkit.messageHandlers.tworld : null;
    window.onNativeCallBack = $.proxy(this._onNativeCallBack, this);
    window.onBack = $.proxy(this._onBack, this);
    window.onToken = $.proxy(this._onToken, this);
  },

  _onBack: function(resp) {
    console.log('onBack', resp);
  },

  _onNativeCallBack: function (resp) {
    if ( this._callback ) {
      this._callback(resp);
    }
  },

  _onToken: function(resp) {
    console.log('onToken', resp);
  },

  _getRandomCode: function () {
    this._randomCode++;
    return Tw.FormatHelper.leadingZeros(this._randomCode, 6);
  }
};
