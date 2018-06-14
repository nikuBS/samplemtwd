Tw.NativeService = function () {
  this._bridge = null;
  this._callbackList = [];
  this._randomCode = 0;

  this._init();
};

Tw.NativeService.prototype = {
  send: function (command, params, callback) {
    Tw.Logger.info('[Native send]', command, params);
    if ( this._bridge ) {
      this._bridge(this._setParameter(command, params, callback));
    }
  },

  _init: function () {
    this._bridge = Tw.BrowserHelper.isAndroid() ? window.tworld : Tw.BrowserHelper.isIos() ? window.webkit.messageHandlers.tworld : null;
    window.onNativeCallBack = $.proxy(this._onNativeCallBack, this);
    window.onBack = $.proxy(this._onBack, this);
  },

  _setParameter: function (command, params, callback) {
    var parameter = {
      command: command,
      params: params
    };
    if ( !Tw.FormatHelper.isEmpty(callback) ) {
      var randomCode = this._getRandomCode();
      parameter.randomCode = randomCode;
      parameter.callback = 'onNativeCallback';
      this._callbackList.push({ randomCode: randomCode, callback: callback });
    }
    if ( Tw.BrowserHelper.isAndroid() ) {
      parameter = JSON.stringify(parameter);
    }
    return parameter;
  },

  _getRandomCode: function () {
    this._randomCode++;
    return Tw.FormatHelper.leadingZeros(this._randomCode, 6);
  },

  _onBack: function (resp) {
    Tw.Logger.info('onBack', resp);
  },

  _onNativeCallBack: function (resp) {
    Tw.Logger.info('[onNativeCallBack]', resp);
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 && !!resp.randomCode ) {
      var fn = _.find(this._callbackList, function (data) {
        return data.randomCode === resp.randomCode;
      }).callback;
      fn(resp);
    }
  }
};
