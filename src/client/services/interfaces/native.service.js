Tw.NativeService = function () {
  this._bridge = null;
  this._callbackList = [];
  this._randomCode = 0;

  this._init();
};

Tw.NativeService.prototype = {
  send: function (command, params, callback) {
    Tw.Logger.info('[Native send]', command, params, this._bridge);
    if ( this._bridge ) {
      var parameter = this._setParameter(command, params, callback);
      this._bridge.postMessage(parameter);
      if ( Tw.BrowserHelper.isIos() ) {
        this._callByIframe(Tw.IOS_URL + command + '?p=' + encodeURIComponent(JSON.stringify(parameter)));
      }
    }
  },

  _init: function () {
    this._bridge = Tw.BrowserHelper.isAndroid() ? window.tworld : Tw.BrowserHelper.isIos() ? window.webkit.messageHandlers.tworld : null;
    window.onNativeCallback = $.proxy(this._onNativeCallback, this);
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

  _callByIframe: function (url) {
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    setTimeout(function () {
      document.body.removeChild(iframe);
    }, 100);
  },

  _getRandomCode: function () {
    this._randomCode++;
    return Tw.FormatHelper.leadingZeros(this._randomCode, 6);
  },

  _onBack: function (resp) {
    Tw.Logger.info('onBack', resp);
    history.back();
  },

  _onNativeCallback: function (_resp) {
    Tw.Logger.info('[onNativeCallBack]' + _resp);
    var resp = (typeof _resp === 'string') ? JSON.parse(_resp) : _resp;
    if ( resp.result === Tw.NTV_CODE.CODE_00 && !!resp.randomCode ) {
      var fn = _.find(this._callbackList, function (data) {
        return data.randomCode === resp.randomCode;
      }).callback;
      fn(resp);
    }
  }
};

Tw.Native = new Tw.LoggerService();