/**
 * FileName: common.login.dormancy.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.05
 */

Tw.CommonLoginDormancy = function (rootEl, target) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;

  this._target = target || '/main/home';

  this._bindEvent();
};

Tw.CommonLoginDormancy.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#btn-activate', $.proxy(function () {
      Tw.Api.request(Tw.NODE_CMD.LOGIN_USER_LOCK)
        .done($.proxy(function (res) {
          var res = { code: '00' };
          if ( res.code === Tw.API_CODE.CODE_00 ) {
            this._apiService.sendNativeSession(Tw.AUTH_LOGIN_TYPE.TID, $.proxy(this._successSetSession, this));
          } else if ( res.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {  // Need service password
            this._historyService.goLoad('/common/member/login/cust-pwd');
          } else {
            Tw.Popup.openAlert(res.code + ' ' + res.msg);
          }
        }, this))
        .fail(function (err) {
          Tw.Logger.error('BFF_03_0010 Fail', err);
        });
    }, this));
  },
  _successSetSession: function () {
    this._historyService.goLoad(this._target);
  }
};
