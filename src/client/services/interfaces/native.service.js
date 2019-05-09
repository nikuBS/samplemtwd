/**
 * @class
 * @desc Native 통신을 위한 service
 * @constructor
 */
Tw.NativeService = function () {
  this._bridge = null;
  this._callbackList = [];
  this._randomCode = 0;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._gnb = null;

  this._init();
};

Tw.NativeService.prototype = {
  /**
   * @function
   * @desc Native command 전달
   * @param command
   * @param params
   * @param callback
   */
  send: function (command, params, callback) {
    Tw.Logger.info('[Native send]', command, params, this._bridge);
    if ( this._bridge ) {
      var parameter = this._setParameter(command, params, callback);
      this._bridge.postMessage(parameter);
    }
  },
  /**
   * @function
   * @desc 전체메뉴(MenuComponent) 객체를 설정하고 /main/home 에서 back button 동작 처리
   * @param gnb - MenuComponent 객체
   */
  setGNB: function (gnb) {
    this._gnb = gnb;
  },
  /**
   * @function
   * @desc 초기화시 세션 전달
   * @param command
   * @param params
   * @param callback
   */
  // only using common.member.init
  sendInitSession: function (command, params, callback) {
    if ( this._bridge ) {
      var parameter = this._setParameter(command, params, callback);
      this._bridge.postMessage(parameter);
    }
  },

  /**
   * @function
   * @desc 서비스 초기화
   * @private
   */
  _init: function () {
    this._bridge = null;
    if ( Tw.BrowserHelper.isApp() ) {
      this._bridge = Tw.BrowserHelper.isAndroid() ? window.tworld : Tw.BrowserHelper.isIos() ? window.webkit.messageHandlers.tworld : null;
    }
    window.onNativeCallback = $.proxy(this._onNativeCallback, this);
    window.onBack = $.proxy(this._onBack, this);
    window.onEasyLogin = $.proxy(this._onEasyLogin, this);
    window.onSessionExpired = $.proxy(this._onSessionExpired, this);
  },

  /**
   * @function
   * @desc Native로 전달할 parameter 구성
   * @param command
   * @param params
   * @param callback
   * @returns {{command: *, params: *}}
   * @private
   */
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

  /**
   * @function
   * @desc callback 맵핑 random code 구성
   * @returns {string}
   * @private
   */
  _getRandomCode: function () {
    this._randomCode++;
    return Tw.FormatHelper.leadingZeros(this._randomCode, 6);
  },

  /**
   * @function
   * @desc 뒤로가기 버튼 callback
   * @private
   */
  _onBack: function () {
    Tw.Logger.info('[onBack]');
    var $popupContainer = this._popupService.isPopup();

    if ( !Tw.FormatHelper.isEmpty($popupContainer) ) {
      if ( !$popupContainer.hasClass('fe-no-back') ) {
        this._popupService.close();
      } else {
        $(window).trigger(Tw.NATIVE_BACK);
      }
    } else {
      if ( /\/main\/home/.test(location.href) || /\/main\/store/.test(location.href) ) {
        if ( !!this._gnb && this._gnb.isOpened() ) {
          this._gnb.close();
        } else {
          this._popupService.openConfirm(Tw.ALERT_MSG_COMMON.EXIT_APP, null, $.proxy(this._exitApp, this));
        }
      } else {
        if ( $('.fe-no-back').length === 0 ) {
          history.back();
        } else {
          $(window).trigger(Tw.NATIVE_BACK);
        }
      }
    }
  },

  /**
   * @function
   * @desc Native command 요청에 대한 callback
   * @param _resp
   * @private
   */
  _onNativeCallback: function (_resp) {
    Tw.Logger.info('[onNativeCallBack]', JSON.stringify(_resp));
    var resp = (typeof _resp === 'string') ? JSON.parse(_resp) : _resp;
    if ( !!resp.randomCode ) {
      var fn = _.find(this._callbackList, function (data) {
        return data.randomCode === resp.randomCode;
      }).callback;
      this._callbackList = _.filter(this._callbackList, function(data) {
        return data.randomCode !== resp.randomCode;
      });
      fn(resp);
    }
  },

  /**
   * @function
   * @desc 간편로그인 요청 들어옴
   * @param resp
   * @private
   */
  _onEasyLogin: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( Tw.BrowserHelper.isAndroid() ) {
        window.location.href = '/common/member/slogin/aos?mdn=' + resp.params.mdn;
      } else {
        window.location.href = '/common/member/slogin/ios';
      }
    } else {
      // error
    }
  },

  /**
   * @function
   * @desc 세션만료 들어옴
   * @param resp
   * @private
   */
  _onSessionExpired: function (resp) {
    Tw.Logger.info('[onSessionExpired]', resp);
    this._tidLanding = new Tw.TidLandingComponent();
    this._tidLanding.logout($.proxy(this._completeLogout, this, resp));
  },

  /**
   * @function
   * @desc 로그아웃 완료 callback
   * @param isAutoLogin
   * @param resp
   * @private
   */
  _completeLogout: function (isAutoLogin, resp) {
    Tw.Logger.info('[completeLogout]', isAutoLogin, resp);
    if ( resp.code !== Tw.API_CODE.NODE_1003 ) {
      if ( isAutoLogin === 'Y' ) {
        Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.HOME_BILL);
        Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.HOME_MICRO_CONTENTS);
        this._tidLanding.goActionSheetLogin(location.pathname + location.search);
      } else {
        this._historyService.replaceURL('/common/member/logout/expire?target=' + location.pathname + location.search);
      }
    }

  },

  /**
   * @function
   * @desc 앱 종료 요청
   * @private
   */
  _exitApp: function () {
    this.send(Tw.NTV_CMD.EXIT, {});
  }
};
