/**
 * FileName: common.member.login.route.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */

Tw.CommonMemberLoginRoute = function (target, type) {
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._init(target, type);
};

Tw.CommonMemberLoginRoute.prototype = {
  _init: function (target, type) {
    var token = window.location.hash.replace(/^#/i, '');
    var url = target;
    var hash = '';
    if ( /urlHash/.test(target) ) {
      target = target.replace(/urlHash/gi, '#');
      url = target.split('#')[0];
      hash = '#' + target.split('#')[1];
    }

    var tidResp = Tw.ParamsHelper.getQueryParams('?' + token);

    this._apiService.request(Tw.NODE_CMD.LOGIN_TID, {
      tokenId: tidResp.id_token,
      state: tidResp.state
    }).done($.proxy(this._successLogin, this, url + hash, type));
  },
  _successLogin: function (target, type, resp) {
    Tw.Logger.info('[Login Resp]', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( type === 'reload' ) {
        this._historyService.replaceURL(target);
      } else {
        this._historyService.goBack();
      }
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {
      // 고객보호비밀번호
      this._historyService.goLoad('/common/member/login/cust-pwd?target=' + encodeURIComponent(target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3235 ) {
      // 휴면계정
      this._historyService.goLoad('/common/member/login/reactive?target=' + encodeURIComponent(target));
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH1003 ) {
      this._historyService.replaceURL('/common/member/login/exceed-fail?');
    } else {
      this._historyService.replaceURL('/common/member/login/fail?errorCode=' + resp.code + '&target=' + encodeURIComponent(target));
    }
  }
};
