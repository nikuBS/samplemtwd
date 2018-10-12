/**
 * FileName: common.biometrics.register.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.10
 */

Tw.CommonBiometricsRegister = function (rootEl) {
  this.$container = rootEl;

  this._bindEvent();
};

Tw.CommonBiometricsRegister.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-register-finger', $.proxy(this._onClickRegisterFinger, this));
    this.$container.on('click', '#fe-bt-register-face', $.proxy(this._onClickRegisterFace, this));
  },
  _onClickRegisterFinger: function () {
    console.log('register finger');
  },
  _onClickRegisterFace: function () {
    console.log('register face');
  }

};
