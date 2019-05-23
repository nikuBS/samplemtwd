/**
 * @file common.member.login.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.07
 */

/**
 * @function
 * @desc 공통 > 로그인 (라우팅시 로그인 처리)
 * @param target
 * @constructor
 */
Tw.CommonMemberLogin = function (target) {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._init(target);
};

Tw.CommonMemberLogin.prototype = {
  /**
   * @member {object}
   * @desc 에러코드
   * @readonly
   * @prop {string} CANCEL 사용자 취소
   */
  ERROR_CODE: {
    CANCEL: 1500
  },

  /**
   * @function
   * @desc 초기화 (로그인 페이지 요청)
   * @param target
   * @private
   */
  _init: function (target) {
    if ( /&amp;/.test(target) ) {
      target = target.replace(/&amp;/gi, '&');
    }
    this._apiService.sendNativeSession('');
    this._goLoad(Tw.NTV_CMD.LOGIN, '/common/tid/login?target=' + encodeURIComponent(target) +
      '&type=reload', $.proxy(this._onNativeLogin, this, target));
  },

  /**
   * @function
   * @desc 앱/웹 분기처리
   * @param nativeCommand
   * @param url
   * @param callback
   * @private
   */
  _goLoad: function (nativeCommand, url, callback) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(nativeCommand, {}, callback);
    } else {
      this._historyService.replaceURL(url);
    }
  },

  /**
   * @function
   * @desc Native TID 로그인 완료 콜백
   * @param target
   * @param resp
   * @private
   */
  _onNativeLogin: function (target, resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._successLogin(target, resp.params);
    } else if ( resp.resultCode === Tw.NTV_CODE.CODE_1500 || resp.resultCode === Tw.NTV_CODE.CODE_3114 ) {
      this._historyService.goBack();
    } else {
      this._historyService.replaceURL('/common/member/login/fail?errorCode=' + resp.code);
    }
  },

  /**
   * @function
   * @desc 로그인 성공 응답 분기 처리
   * @param target
   * @param resp
   * @private
   */
  _successLogin: function (target, resp) {
    Tw.Logger.info('[Login Resp]', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.sendNativeSession(Tw.AUTH_LOGIN_TYPE.TID, $.proxy(this._successSetSession, this, target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {
      // 고객보호비밀번호
      this._historyService.goLoad('/common/member/login/cust-pwd?target=' + encodeURIComponent(target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3235 ) {
      // 휴면계정
      this._historyService.goLoad('/common/member/login/reactive?target=' + encodeURIComponent(target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH1003 ) {
      this._historyService.replaceURL('/common/member/login/exceed-fail');
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH3236 ) {
      this._historyService.goLoad('/common/member/login/lost?target=' + encodeURIComponent(target));
    } else {
      this._historyService.replaceURL('/common/member/login/fail?errorCode=' + resp.code);
    }
  },

  /**
   * @function
   * @desc Native 세션 저장 완료 콜백 처리
   * @param target
   * @private
   */
  _successSetSession: function (target) {
    if ( target === location.pathname + location.search ) {
      this._historyService.reload();
    } else {
      this._historyService.replaceURL(target);
    }
  }
};
