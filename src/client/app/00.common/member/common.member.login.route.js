/**
 * FileName: common.member.login.route.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */

Tw.CommonMemberLoginRoute = function (target, type, isLogin) {
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._init(target, type, isLogin === 'true');
};

Tw.CommonMemberLoginRoute.prototype = {
  _init: function (target, type, isLogin) {
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

    var tidResp = Tw.ParamsHelper.getQueryParams('?' + token);

    if ( isLogin ) {
      this._historyService.goBack();
    } else {
      this._apiService.request(Tw.NODE_CMD.LOGIN_TID, {
        tokenId: tidResp.id_token,
        state: tidResp.state
      }).done($.proxy(this._successLogin, this, url + hash, type));
    }
  },
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
  }
};
