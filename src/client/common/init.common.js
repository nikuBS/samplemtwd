Tw.Environment = { cdn: '' };
Tw.Init = function () {
  this._apiService = null;
  this._nativeService = null;

  this._initService();
  this._initComponent();
  this._getEnvironment();
  this._setXtvid();
  // this._setNodeCookie();
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
    new Tw.MaskingComponent();
    new Tw.ShareComponent();
    new Tw.SearchComponent();
  },

  _getEnvironment: function () {
    this._apiService.request(Tw.NODE_CMD.GET_ENVIRONMENT, {})
      .done($.proxy(this._logVersion, this));
  },

  _logVersion: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      Tw.Environment = result;
      Tw.Logger.info('[Version]', result.version);
      $(window).trigger('env');

      // if ( (result.environment === 'development' || result.environment === 'staging') && /\/home/.test(location.href) ) {
      //   /* jshint undef: false */
      //   alert(result.version);
      //   /* jshint undef: false */
      // }
      if ( result.environment !== 'local' && /\/home/.test(location.href) ) {
        Tw.Popup.toast(result.version);
      }
    }
  },

  _setXtvid: function () {
    var cookie = Tw.CommonHelper.getCookie('XTVID');
    if ( Tw.BrowserHelper.isApp() && !Tw.FormatHelper.isEmpty(cookie) ) {
      this._nativeService.send(Tw.NTV_CMD.SET_XTVID, { xtvId: cookie });
    }
  },
  _setNodeCookie: function () {
    var cookie = Tw.CommonHelper.getCookie('TWM');
    if ( Tw.BrowserHelper.isApp() && !Tw.FormatHelper.isEmpty(cookie) ) {
      this._nativeService.send(Tw.NTV_CMD.SESSION, {
        serverSession: cookie,
        expired: 60 * 60 * 1000
      });
    }
  }

};

$(document).ready(function () {
  new Tw.Init();
});