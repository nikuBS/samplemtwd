/**
 * FileName: common.login.dormancy.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.05
 */

Tw.CommonLoginDormancy = function (rootEl) {
  this.$container = rootEl;

  this._bindEvent();
};

Tw.CommonLoginDormancy.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#btn-activate', function() {
      Tw.Api.request(Tw.NODE_CMD.LOGIN_USER_LOCK)
        .done(function (res) {
          if (res.code === Tw.API_CODE.CODE_00) {
            window.location = '/main/home';
          } else if (res.code === Tw.API_LOGIN_ERROR.ICAS3228) {  // Need service password
            window.location = '/common/login/customer-pwd';
          } else {
            Tw.Popup.openAlert(res.code + ' ' + res.msg);
          }
        })
        .fail(function (err) {
          Tw.Logger.error('BFF_03_0010 Fail', err);
        });
    });
  }
};
