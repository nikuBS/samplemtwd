/**
 * FileName: auth.login.service-pwd.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.11
 */

Tw.AuthLoginServicePwd = function (rootEl, isPopup) {
  this.$container = rootEl;
  this._isPopup = isPopup;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
};

Tw.AuthLoginServicePwd.prototype = {
  _cachedElement: function () {
    this.$inputBox = this.$container.find('.inputbox');
  },
  _bindEvent: function () {
    this.$container.on('click', '.bt-red1 > button', $.proxy(this._requestLogin, this));
  },
  _requestLogin: function () {
    var pwd = this.$container.find('input').val();
    this._apiService.request(Tw.API_CMD.BFF_03_0009, { svcPwd: pwd })
      .done($.proxy(this._onLoginReuestDone, this))
      .fail(function (err) {
        Tw.Logger.error('BFF_03_0009 Fail', err);
      });
  },
  _onLoginReuestDone: function (res) {
    console.log(res);
    if (res.code === Tw.API_CODE.CODE_00) {
      if (this._isPopup) {
        // TODO: close popup and move on..
      } else {
        window.location = '/home';
      }
    } else {
      this.$inputBox.addClass('error');
      // TODO: show X icon and err msg
      this._popupService.openAlert(Tw.MSG_AUTH.LOGIN_A01);
    }
  }
};
