Tw.Init = function () {
  this._apiService = null;
  this._nativeService = null;

  this._initService();
  this._initComponent();
  this._getDeviceInfo();
  this._getEnvironment();
  this._getSession();
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
      if ( (result.environment === 'development' || result.environment === 'staging') && /\/home/.test(location.href) ) {
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
    Tw.DeviceInfo = new Tw.DeviceService();
    this._nativeService.send(Tw.NTV_CMD.GET_DEVICE, {}, $.proxy(this._setDeviceInfo, this));
  },

  _setDeviceInfo: function (resp) {
    Tw.Logger.info('[Device Info]', resp);
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {

      Tw.DeviceInfo.setDeviceInfo(resp.params);

      this._apiService.request(Tw.NODE_CMD.SET_DEVICE, resp.params)
        .done($.proxy(this._successSetDevice, this));
    }
  },
  _successSetDevice: function (resp) {
    console.log(resp);
  },
  _getSession: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SERVER_SERSSION, {})
      .done($.proxy(this._setSession, this));
  },

  _setSession: function (resp) {
    if(resp.code === Tw.API_CODE.CODE_00) {
      this._nativeService.sned(Tw.NTV_CMD.SESSION, {
        serverSession: resp.result,
        expired: 60 * 60 * 1000
      });
    }
  }
};

$(document).ready(function () {
  new Tw.Init();
});