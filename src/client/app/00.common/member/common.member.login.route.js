/**
 * @file common.member.login.route.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.12
 */

/**
 * @class
 * @desc 공통 > 로그인/로그아웃 > 로그인 처리
 * @param target
 * @param type
 * @param isLogin
 * @constructor
 */
Tw.CommonMemberLoginRoute = function (target, type, isLogin, state) {
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._init(target, type, isLogin === 'true', state);
};

Tw.CommonMemberLoginRoute.prototype = {
  /**
   * @function
   * @desc 예외처리 및 로그인 API 요청
   * @param target
   * @param type
   * @param isLogin
   * @private
   */
  _init: function (target, type, isLogin, state) {
    if ( type === 'cancel' ) {
      this._historyService.replaceURL(target);
      return;
    }

    var token = window.location.hash.replace(/^#/i, '');
    if ( /urlQuery/.test(target) ) {
      target = target.replace(/urlQuery/gi, '&');
    }

    var url = target;
    var hash = '';
    if ( /urlHash/.test(target) ) {
      target = target.replace(/urlHash/gi, '#');
      url = target.split('#')[0];
      hash = '#' + target.split('#')[1];
    }

    var tidResp = Tw.UrlHelper.getQueryParams('?' + token);
    if ( tidResp.state === state ) {
      console.log('[TID STATE SUCCESS]', tidResp.state, state);
      state = tidResp.state;
    } else {
      console.log('[TID STATE ERROR]', tidResp.state, state);
      this._apiService.request(Tw.API_CMD.BFF_LOGIN_ERROR, {
        token: tidResp.id_token,
        rsltMsg: 'TID state error : ' + state + ' : ' + tidResp.state
      })
        .done($.proxy(function (resp) {
          console.log('[TID ERROR LOG Success]', resp);
        }, this))
        .fail($.proxy(function (error) {
          console.log('[TID ERROR LOG Fail]', error);
        }, this));
    }

    if ( isLogin ) {
      this._historyService.goBack();
    } else {
      this._apiService.request(Tw.NODE_CMD.LOGIN_TID, {
        tokenId: tidResp.id_token,
        state: state
      }).done($.proxy(this._successLogin, this, url + hash, type))
        .fail($.proxy(this._failLogin, this));
    }
  },

  /**
   * @function
   * @desc 로그인 응답 처리
   * @param target
   * @param type
   * @param resp
   * @private
   */
  _successLogin: function (target, type, resp) {
    Tw.Logger.info('[Login Resp]', target, type, resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL(target);
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {
      // 고객보호비밀번호
      this._historyService.goLoad('/common/member/login/cust-pwd?target=' + encodeURIComponent(target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3235 ) {
      // 휴면계정
      this._historyService.goLoad('/common/member/login/reactive?target=' + encodeURIComponent(target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH1003 ) {
      this._historyService.goLoad('/common/tid/logout?type=' + Tw.TID_LOGOUT.EXCEED_FAIL + '&errorCode=' + resp.code);
      // this._historyService.replaceURL('/common/member/login/exceed-fail');
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH3236 ) {
      this._historyService.goLoad('/common/member/login/lost?target=' + encodeURIComponent(target));
    } else {
      this._historyService.goLoad('/common/tid/logout?type=' + Tw.TID_LOGOUT.LOGIN_FAIL + '&errorCode=' + resp.code);
      // this._historyService.replaceURL('/common/member/login/fail?errorCode=' +  resp.code);
    }
  },

  /**
   * @function
   * @desc 로그인 실패 처리
   * @param error
   * @private
   */
  _failLogin: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  }
};
