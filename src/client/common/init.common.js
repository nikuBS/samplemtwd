Tw.Environment = {
  init: false,
  cdn: ''
};
Tw.Init = function () {
  this._apiService = null;
  this._nativeService = null;

  this._initService();
  this._initComponent();
  this._getEnvironment();
  this._setXtvid();
  this._sendXtractorLoginDummy();
  this._setGesture();
  // this._setNodeCookie();
};

Tw.Init.prototype = {
  _initService: function () {
    Tw.Ui = new Tw.UIService();
    Tw.Logger = new Tw.LoggerService();
    Tw.Popup = new Tw.PopupService();
    Tw.Native = new Tw.NativeService();
    Tw.Api = new Tw.ApiService();
    Tw.Error = new Tw.ErrorService();
    Tw.Tooltip = new Tw.TooltipService();

    this._apiService = Tw.Api;
    this._nativeService = Tw.Native;
  },

  _initComponent: function () {
    new Tw.MenuComponent();
    new Tw.FooterComponent();
    new Tw.LineLayerComponent();
  },

  _getEnvironment: function () {
    this._apiService.request(Tw.NODE_CMD.GET_ENVIRONMENT, {})
      .done($.proxy(this._logVersion, this));
  },

  _logVersion: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      Tw.Environment = result;
      Tw.Environment.init = true;
      Tw.Logger.info('[Version]', Tw.Environment.version);
      $(window).trigger(Tw.INIT_COMPLETE);

      // if ( (result.environment === 'dev' || result.environment === 'stg') && /\/home/.test(location.href) ) {
      //   /* jshint undef: false */
      //   alert(result.version);
      //   /* jshint undef: false */
      // }
      if ( Tw.Environment.environment !== 'local' && /\/home/.test(location.href) ) {
        Tw.Popup.toast(Tw.Environment.version);
      }
    }
  },

  _setXtvid: function () {
    var cookie = Tw.CommonHelper.getCookie('XTVID'),
      isLog = Tw.CommonHelper.getCookie('XTVID_LOG');

    if ( Tw.BrowserHelper.isApp() && !Tw.FormatHelper.isEmpty(cookie) && Tw.FormatHelper.isEmpty(isLog) ) {
      this._nativeService.send(Tw.NTV_CMD.SET_XTVID, { xtvId: cookie });
      Tw.CommonHelper.setCookie('XTVID_LOG', 'Y');
    }
  },

  _setNodeCookie: function () {
    var cookie = Tw.CommonHelper.getCookie('TWM');
    if ( Tw.BrowserHelper.isApp() && !Tw.FormatHelper.isEmpty(cookie) ) {
      this._nativeService.send(Tw.NTV_CMD.SESSION, {
        serverSession: cookie,
        expired: Tw.SESSION_EXPIRE_TIME
      });
    }
  },

  _sendXtractorLoginDummy: function () {
    var cookie = Tw.CommonHelper.getCookie('XTSVCGR');
    if ( Tw.FormatHelper.isEmpty(cookie) || cookie === 'LOGGED' || Tw.FormatHelper.isEmpty(window.XtractorScript) ) {
      return;
    }

    if (Tw.BrowserHelper.isApp()) {
      return Tw.CommonHelper.setXtSvcInfo();
    }

    try {
      window.XtractorScript.xtrLoginDummy($.param({
        V_ID: Tw.CommonHelper.getCookie('XTVID'),
        L_ID: Tw.CommonHelper.getCookie('XTLID'),
        T_ID: Tw.CommonHelper.getCookie('XTLOGINID'),
        GRADE: Tw.CommonHelper.getCookie('XTSVCGR')
      }));
    } catch ( e ) {
      console.log(e.message);
    }

    Tw.CommonHelper.setCookie('XTSVCGR', 'LOGGED');
  },
  _setGesture: function () {
    if ( /\/home/.test(location.href) ) {
      this._nativeService.send(Tw.NTV_CMD.SET_SWIPE_GESTURE_ENABLED, {
        isEnabled: false
      });
    } else {
      this._nativeService.send(Tw.NTV_CMD.SET_SWIPE_GESTURE_ENABLED, {
        isEnabled: true
      });
    }


  }

};

$(document).ready(function () {
  new Tw.Init();
});