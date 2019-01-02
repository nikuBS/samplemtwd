Tw.NativeService = function () {
  this._bridge = null;
  this._callbackList = [];
  this._randomCode = 0;
  this._popupService = Tw.Popup;
  this._gnb = null;

  this._init();
};

Tw.NativeService.prototype = {
  send: function (command, params, callback) {
    Tw.Logger.info('[Native send]', command, params, this._bridge);
    if ( this._bridge ) {
      var parameter = this._setParameter(command, params, callback);
      this._bridge.postMessage(parameter);
      // if ( Tw.BrowserHelper.isIos() ) {
      //   this._callByIframe(Tw.IOS_URL + command + '?p=' + encodeURIComponent(JSON.stringify(parameter)));
      // }
    }
  },
  setGNB: function (gnb) {
    this._gnb = gnb;
  },

  _init: function () {
    this._bridge = null;
    if ( Tw.BrowserHelper.isApp() ) {
      this._bridge = Tw.BrowserHelper.isAndroid() ? window.tworld : Tw.BrowserHelper.isIos() ? window.webkit.messageHandlers.tworld : null;
    }
    window.onNativeCallback = $.proxy(this._onNativeCallback, this);
    window.onBack = $.proxy(this._onBack, this);
    window.onInit = $.proxy(this._onInitApp, this);
    window.onEasyLogin = $.proxy(this._onEasyLogin, this);
    window.onSessionExpired = $.proxy(this._onSessionExpired, this);
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
    if ( /\/main\/home/.test(location.href) ) {
      if ( this._popupService.isPopup() ) {
        this._popupService.close();
      } else if (!!this._gnb && this._gnb.isOpened()) {
        this._gnb.close();
      } else {
        this._popupService.openConfirm(Tw.ALERT_MSG_COMMON.EXIT_APP, null, $.proxy(this._exitApp, this));
      }
    } else {
      history.back();
    }
  },

  _onNativeCallback: function (_resp) {
    Tw.Logger.info('[onNativeCallBack]', JSON.stringify(_resp));
    var resp = (typeof _resp === 'string') ? JSON.parse(_resp) : _resp;
    if ( !!resp.randomCode ) {
      var fn = _.find(this._callbackList, function (data) {
        return data.randomCode === resp.randomCode;
      }).callback;
      fn(resp);
    }
  },

  _onInitApp: function () {
    Tw.Logger.info('[Init]');
  },

  _onEasyLogin: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( Tw.BrowserHelper.isAndroid() ) {
        window.location.href = '/common/member/slogin/aos?mdn=' + resp.params.mdn;
      } else {
        window.location.href = '/common/member/slogin/ios';
      }
    } else {
      this._popupService.openAlert(Tw.MSG_AUTH.EASY_LOGIN_FAIL);
    }
  },

  _onSessionExpired: function (resp) {
    Tw.Logger.info('[onSessionExpired]', resp);
  },

  _exitApp: function () {
    this.send(Tw.NTV_CMD.EXIT, {});
  }
};
