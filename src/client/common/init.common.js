Tw.Environment = {
  init: false,
  cdn: ''
};
Tw.Init = function () {
  this._apiService = null;
  this._nativeService = null;

  this._initService();
  this._initComponent();
  this._initXtvId();
  this._getEnvironment();
  this._sendXtractorLoginDummy();
  // this._setGesture();
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
    new Tw.MaskingComponent();
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

      // Store tab height issue, toast popup blocks height calculation and scroll does not work properly
      if ( Tw.Environment.environment !== 'local' && Tw.Environment.environment !== 'prd' && /\/home/.test(location.href) ) {
        Tw.Popup.toast('QA_v5.12.4');
      }
    }
  },

  _initXtvId: function () {
    if ( !Tw.BrowserHelper.isApp() ) {
      return;
    }

    this._nativeService.send(Tw.NTV_CMD.LOAD, {
      key: Tw.NTV_STORAGE.XTVID
    }, $.proxy(function(res) {
      if ( res.resultCode === Tw.NTV_CODE.CODE_00 ) {
        this._sendXtvId(res.params.value);
        return Tw.CommonHelper.setCookie('XTVID', res.params.value);
      }

      var cookie = Tw.CommonHelper.getCookie('XTVID');
      if ( res.resultCode !== Tw.NTV_CODE.CODE_00 && !Tw.FormatHelper.isEmpty(cookie) ) {
        this._sendXtvId(cookie);
        this._nativeService.send(Tw.NTV_CMD.SAVE, {
          key: Tw.NTV_STORAGE.XTVID,
          value: cookie
        });
      }
    }, this));
  },

  _sendXtvId: function(xtvId) {
    var isLog = Tw.CommonHelper.getCookie('XTVID_LOG');
    if ( !Tw.FormatHelper.isEmpty(isLog) ) {
      return;
    }

    this._nativeService.send(Tw.NTV_CMD.SET_XTVID, { xtvId: xtvId });
    Tw.CommonHelper.setCookie('XTVID_LOG', 'Y');
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
    var cookie = Tw.CommonHelper.getCookie('XT_LOGIN_LOG');
    if (!Tw.FormatHelper.isEmpty(cookie) || Tw.FormatHelper.isEmpty(window.XtractorScript) && !Tw.BrowserHelper.isApp()) {
      return;
    }

    this._apiService.request(Tw.NODE_CMD.GET_XTINFO, {})
      .done($.proxy(function(res) {
        if (Tw.FormatHelper.isEmpty(res.result)) {
          return;
        }

        if (!Tw.BrowserHelper.isApp()) {
          Tw.CommonHelper.setCookie('XT_LOGIN_LOG', 'Y');
          window.XtractorScript.xtrLoginDummy($.param({
            V_ID: Tw.CommonHelper.getCookie('XTVID'),
            L_ID: res.result.XTLID,
            T_ID: res.result.XTLOGINID,
            GRADE: res.result.XTSVCGR
          }));
          return;
        }

        if (res.result.XTLOGINTYPE !== 'Z') {
          Tw.CommonHelper.setCookie('XT_LOGIN_LOG', 'Y');
          Tw.Native.send(Tw.NTV_CMD.SET_XTSVCINFO, {
            xtLid: res.result.XTLID,
            xtLoginId: res.result.XTLOGINID,
            xtSvcGr: res.result.XTSVCGR
          });
        }
      }, this));
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