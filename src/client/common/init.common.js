Tw.Init = function () {
  this._initService();
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
  },

  _logVersion: function (resp) {
    if ( resp.environment === 'development' || resp.environment === 'qa' ) {
      /* jshint undef: false */
      alert(Tw.environment.version);
      /* jshint undef: false */
    }
    Tw.Logger.info('[Version]', Tw.environment.version);
  },

  _getEnvironment: function () {
    Tw.Api.request(Tw.NODE_CMD.GET_ENVIRONMENT, {})
      .done($.proxy(this._logVersion, this));
  },

  _getDeviceInfo: function () {
    Tw.Native.send(Tw.NTV_CMD.GET_DEVICE, {}, $.proxy(this._setDeviceInfo, this));
  },

  _setDeviceInfo: function (resp) {
    Tw.Logger.info('[Device Info]', resp);
  }
};

$(document).ready(function () {
  new Tw.Init();
});