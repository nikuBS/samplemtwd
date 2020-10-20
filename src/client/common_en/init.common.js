/**
 * @file init.common.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.05
 */

Tw.Environment = {
  init: false,
  cdn: ''
};

/**
 * @class
 * @desc 초기화
 * @constructor
 */
Tw.Init = function () {
  this._apiService = null;
  this._nativeService = null;
  this._eqpMdlCd = '';

  this._initService();
  this._initComponent();
  this._initXtvId();
  this._getEnvironment();
  this._getSvcInfo();
  this._sendXtractorLoginDummy();
  this._initEidHanlder();
};

Tw.Init.prototype = {
  /**
   * @function
   * @desc 서비스 초기화
   * @private
   */
  _initService: function () {
    Tw.Logger = {
      log: function () {
      },
      info: function () {
      },
      warn: function () {
      },
      error: function () {
      }
    };
    Tw.Ui = new Tw.UIService();
    Tw.Popup = new Tw.PopupService();
    Tw.Native = new Tw.NativeService();
    Tw.Api = new Tw.ApiService();
    Tw.Error = new Tw.ErrorService();
    Tw.Tooltip = new Tw.TooltipService();
    Tw.Bpcp = new Tw.BpcpService();
    Tw.Tracker = Tw.TrackerService.newInstance();
    Tw.Survey = new Tw.SurveyService();

    this._apiService = Tw.Api;
    this._nativeService = Tw.Native;

    // cookie의 TWM 값과 sessionStorage에 저장된 값을 비교하여, 다를 경우 세션만료 페이지로 이동 시킨다.
    Tw.CommonHelper.checkValidSession(location.pathname, '', 'CLIENT_PAGE_RES');
  },

  /**
   * @function
   * @desc componnet 초기화
   * @private
   */
  _initComponent: function () {
    new Tw.MenuComponent();
    new Tw.FooterComponent();
    new Tw.LineLayerComponent();
    new Tw.MaskingComponent();
  },

  /**
   * @function
   * @desc Node 환경변수 요청
   * @private
   */
  _getEnvironment: function () {
    this._apiService.request(Tw.NODE_CMD.GET_ENVIRONMENT, {})
      .done($.proxy(this._logVersion, this))
      .fail($.proxy(this._failEnvironment, this));
  },

  /**
   * @function
   * @desc Node 환경변수 요청 응답 처리
   * @param resp
   * @private
   */
  _logVersion: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      Tw.Environment = result;
      Tw.Environment.init = true;
      Tw.Logger = new Tw.LoggerService(Tw.Environment.environment);
      Tw.Logger.info('[Version]', Tw.Environment.version);
      $(window).trigger(Tw.INIT_COMPLETE);

      // if ( (result.environment === 'dev' || result.environment === 'stg') && /\/home/.test(location.href) ) {
      //   /* jshint undef: false */
      //   alert(result.version);
      //   /* jshint undef: false */
      // }

      // Store tab height issue, toast popup blocks height calculation and scroll does not work properly
      if ( Tw.Environment.environment !== 'local' && Tw.Environment.environment !== 'prd' && /\/home/.test(location.href) ) {
        Tw.Popup.toast('QA_v5.73.0');
      }

      //this._initTrackerApi();
    }
  },

  /**
   * @function
   * @desc Node 환경변수 요청 실패 처리
   * @param error
   * @private
   */
  _failEnvironment: function (error) {
    Tw.Logger.error(error);
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc Xtractor 초기화
   * @private
   */
  _initXtvId: function () {
    if ( !Tw.BrowserHelper.isApp() ) {
      return;
    }

    this._nativeService.send(Tw.NTV_CMD.LOAD, {
      key: Tw.NTV_STORAGE.XTVID
    }, $.proxy(function (res) {
      if ( res.resultCode === Tw.NTV_CODE.CODE_00 ) {
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

  /**
   * @function
   * @desc Xtractor 쿠키 설정
   * @param xtvId
   * @private
   */
  _sendXtvId: function (xtvId) {
    var isLog = Tw.CommonHelper.getCookie('XTVID_LOG');
    if ( !Tw.FormatHelper.isEmpty(isLog) ) {
      return;
    }

    this._nativeService.send(Tw.NTV_CMD.SET_XTVID, { xtvId: xtvId });
    Tw.CommonHelper.setCookie('XTVID_LOG', 'Y');
  },

  /**
   * @function
   * @desc
   * @private
   */
  _getSvcInfo: function () {
    var _this = this;

    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(function (res) {
        if( res.code===Tw.API_CODE.CODE_00 ) {
          if( !Tw.FormatHelper.isEmpty(res.result) ) {
            if( !Tw.FormatHelper.isEmpty(res.result.eqpMdlCd) ) {
              _this._eqpMdlCd = res.result.eqpMdlCd;
            }                  
          }
        }
      }));
  },

  /**
   * @function
   * @desc
   * @private
   */
  _sendXtractorLoginDummy: function () {
    var _this = this;

    var cookie = Tw.CommonHelper.getCookie('XT_LOGIN_LOG');
    if ( !Tw.FormatHelper.isEmpty(cookie) || Tw.FormatHelper.isEmpty(window.XtractorScript) && !Tw.BrowserHelper.isApp() ) {
      return;
    }

    this._apiService.request(Tw.NODE_CMD.GET_XTINFO, {})
      .done($.proxy(function (res) {
        if ( Tw.FormatHelper.isEmpty(res.result) ) {
          return;
        }

        if ( !Tw.BrowserHelper.isApp() ) {
          Tw.CommonHelper.setCookie('XT_LOGIN_LOG', 'Y');
          window.XtractorScript.xtrLoginDummy($.param({
            V_ID: Tw.CommonHelper.getCookie('XTVID'),
            L_ID: res.result.XTLID,
            T_ID: res.result.XTLOGINID,
            GRADE: res.result.XTSVCGR
          }));
          return;
        }

        if ( res.result.XTLOGINTYPE !== 'Z' ) {
          Tw.CommonHelper.setCookie('XT_LOGIN_LOG', 'Y');
          Tw.Native.send(Tw.NTV_CMD.SET_XTSVCINFO, {
            xtLid: res.result.XTLID,
            xtLoginId: res.result.XTLOGINID,
            xtSvcGr: res.result.XTSVCGR
          });
        } else if ( res.result.XTLOGINTYPE === 'Z' ) {
          Tw.CommonHelper.setCookie('XT_LOGIN_LOG', 'Y');

          var userAgentString = Tw.BrowserHelper.getUserAgent();
          var appVersion = '';
          var eqpMdlNm = '';
          var eqpMdlCd = '';
          var osInfo = '';

          // App Version 정보
          if ( /appVersion:/.test(userAgentString) ) {
            appVersion = userAgentString.match(/\|appVersion:([\.0-9]*)\|/)[1];
          }
          // 단말 모델명 (ex. SHW-123S)
          if ( /model:/.test(userAgentString) ) {
            eqpMdlNm = userAgentString.split('model:')[1].split('|')[0];
          }
          
          // OS 정보 (ex. Android 1.1.1)
          if (Tw.BrowserHelper.isAndroid()) {
            osInfo = 'Android ' + Tw.BrowserHelper.getAndroidVersion();
          } else if (Tw.BrowserHelper.isIos()) {
            osInfo = 'Ios ' + Tw.BrowserHelper.getIosVersion();
          }

          // // 단말 모델코드 (ex. CCAE)
          if ( !Tw.FormatHelper.isEmpty(_this._eqpMdlCd) ) {
            eqpMdlCd = _this._eqpMdlCd;
          } else {
            eqpMdlCd = 'undefined';
          }
          
          console.log('OS버전 : ' + osInfo + '\n앱버전 : ' + appVersion + '\n모델명 : ' + eqpMdlNm + '\n모델코드 : ' + eqpMdlCd);

          window.XtractorScript.xtrLoginDummy($.param({
            V_ID: Tw.CommonHelper.getCookie('XTVID'),
            L_ID: res.result.XTLID,
            T_ID: res.result.XTLID, // 간편로그인의 경우 ID 대신 서비스관리번호를 수집함.
            GRADE: 'Z',
            LOGIN_TYPE: 'Z',
            OS: osInfo,
            APP_VER: appVersion,
            MODEL: eqpMdlNm,
            MDL_CD: eqpMdlCd
          }));
        }
      }, this));
  },

  /**
   * EID 관리 공통 핸들러
   */
  _initEidHanlder: function() {
    Tw.EID_TYPES.replaceHtmlEidCode($('body'));
  },

  /**
   * @function
   * @desc
   * @private
   */
  _initTrackerApi: function () {
    if ( !Tw.BrowserHelper.isApp() ) {  // App 환경에서만 동작
      return;
    }

    this._nativeService.send(Tw.NTV_CMD.GET_ADID, {}, $.proxy(this._sendTrackerApi, this));
  },

  /**
   * @function
   * @desc
   * @param res
   * @private
   */
  _sendTrackerApi: function (res) {
    if ( res.resultCode !== Tw.NTV_CODE.CODE_00 || Tw.FormatHelper.isEmpty(res.params.adid) ) {
      return;
    }

    var url    = Tw.Environment.environment !== 'prd' ? Tw.TRACKER_API.targetUrl.development : Tw.TRACKER_API.targetUrl.production,
        params = {
          site: Tw.TRACKER_API.siteId,
          platform: 1,
          ua: navigator.userAgent,
          page: location.href
        };

    if ( location.referrer && !Tw.FormatHelper.isEmpty(location.referrer) ) {
      params.referer = location.referrer;
    }

    if ( screen && screen.width && screen.height ) {
      params.res = screen.width + 'x' + screen.height;
    }

    if ( Tw.BrowserHelper.isAndroid() ) {
      params.adid = res.params.adid;
    }

    if ( Tw.BrowserHelper.isIos() ) {
      params.idfa = res.params.idfa;
    }

    Tw.CommonHelper.sendRequestImg(url + '?' + $.param(params));
  }

};

$(document).ready(function () {
  new Tw.Init();
});
