Tw.Init = function () {
  this._initService();
  this._logVersion();
  this._getDeviceInfo();
};

Tw.Init.prototype = {
  _initService: function () {
    Tw.Ui = new Tw.UIService();
    Tw.Logger = new Tw.LoggerService();
    Tw.Native = new Tw.NativeService();
    Tw.History = new Tw.HistoryService();
    Tw.Popup = new Tw.PopupService();
    Tw.Api = new Tw.ApiService();
  },

  _logVersion: function () {
    Tw.Logger.info('[Version]', Tw.environment.version);
  },

  _getDeviceInfo: function () {
    Tw.Native.send(Tw.NTV_CMD.GET_DEVICE_INFO, {}, $.proxy(this._setDeviceInfo, this));
  },

  _setDeviceInfo: function (resp) {
    Tw.Logger.info('[Device Info]', resp);
  }
};

$(document).ready(function () {
  var init = new Tw.Init();
});