Tw.Environment = { cdn: '' };
Tw.Init = function () {
  this._apiService = null;
  this._nativeService = null;

  this._initService();
  this._initComponent();
  // this._getDeviceInfo();
  this._getEnvironment();
  this._apiService.setSession();
  this._setXtvid();
};

Tw.Init.prototype = {
  _initService: function () {
    Tw.Ui = new Tw.UIService();
    Tw.Logger = new Tw.LoggerService();
    Tw.Native = new Tw.NativeService();
    Tw.Popup = new Tw.PopupService();
    Tw.Api = new Tw.ApiService();
    Tw.Error = new Tw.ErrorService();
    Tw.Tooltip = new Tw.TooltipService();

    this._apiService = Tw.Api;
    this._nativeService = Tw.Native;
  },

  _initComponent: function () {
    new Tw.MenuComponent();
    // new Tw.LineComponent();
    new Tw.MaskingComponent();
  },

  _logVersion: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      Tw.Environment = result;
      Tw.Logger.info('[Version]', result.version);
      Tw.Popup = new Tw.PopupService();
      $(window).trigger('env');

      if ( (result.environment === 'development' || result.environment === 'staging') && /\/home/.test(location.href) ) {
        /* jshint undef: false */
        // alert(result.version);
        /* jshint undef: false */
      }
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

  _setXtvid: function() {
    if (Tw.FormatHelper.isEmpty(document.cookie) || !Tw.BrowserHelper.isApp()) {
      return;
    }

    var XTVID = null;
    _.each(document.cookie.split(';'), function(cookieItem) {
      var cookieItemToken = cookieItem.split('=');
      if (cookieItemToken[0] === 'XTVID') {
        XTVID = cookieItemToken[1];
        return false;
      }
    });

    if (!Tw.FormatHelper.isEmpty(XTVID)) {
      this._nativeService.send(Tw.NTV_CMD.SET_XTVID, { xtvId: XTVID });
    }
  }

};

$(document).ready(function () {
  new Tw.Init();
});