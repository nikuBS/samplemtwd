/**
 * FileName: auth.login.dormancy.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.05
 */

Tw.AuthLoginDormancy = function (rootEl) {
  this.$container = rootEl;

  this._bindEvent();
};

Tw.AuthLoginDormancy.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#btn-activate', function() {
      Tw.Api.request(Tw.API_CMD.BFF_03_0010)
        .done(function (res) {
          if (res.code === Tw.API_CODE.CODE_00) {
            window.location = '/home';
          } else {
            Tw.Popup.openAlert(res.msg);
          }
        })
        .fail(function (err) {
          Tw.Logger.error('BFF_03_0010 Fail', err);
        });
    });
  }
};
