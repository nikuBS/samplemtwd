Tw.Init = function () {
  this._apiService = null;
  this._nativeService = null;

  this._initService();
  this._initComponent();
  this._getDeviceInfo();
  this._getEnvironment();
};

Tw.Init.prototype = {
  _initService: function () {
    Tw.Ui = new Tw.UIService();
    Tw.Logger = new Tw.LoggerService();
    Tw.Native = new Tw.NativeService();
    Tw.Popup = new Tw.PopupService();
    Tw.Api = new Tw.ApiService();
    Tw.Error = new Tw.ErrorService();

    this._apiService = Tw.Api;
    this._nativeService = Tw.Native;
  },

  _initComponent: function () {
    new Tw.MenuComponent();
    new Tw.LineComponent();
  },

  _logVersion: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      if ( (result.environment === 'development' || result.environment === 'qa') && /\/home/.test(location.href) ) {
        /* jshint undef: false */
        alert(Tw.environment.version);
        /* jshint undef: false */
      }
      Tw.Logger.info('[Version]', Tw.environment.version);
    }
  },

  _getEnvironment: function () {
    this._apiService.request(Tw.NODE_CMD.GET_ENVIRONMENT, {})
      .done($.proxy(this._logVersion, this));
  },

  _getDeviceInfo: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_DEVICE, {}, $.proxy(this._setDeviceInfo, this));
  },

  _setDeviceInfo: function (resp) {
    Tw.Logger.info('[Device Info]', resp);
    this._apiService.request(Tw.NODE_CMD.SET_DEVICE, resp)
      .done($.proxy(this._successSetDivice, this));
  },
  _successSetDivice: function (resp) {
    console.log(resp);
  }
};

$(document).ready(function () {
  new Tw.Init();
});