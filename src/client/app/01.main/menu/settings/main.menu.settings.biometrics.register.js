/**
 * FileName: main.menu.settings.biometrics.register.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.10
 */

Tw.MainMenuSettingsBiometricsRegister = function (target) {
  this._target = target;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._biometricsComplete = new Tw.MainMenuSettingsBiometricsComplete(this._target);

  this._complete = false;
};

Tw.MainMenuSettingsBiometricsRegister.prototype = {
  open: function () {
    this._popupService.open({
      hbs: 'MA_03_01_02_01_03',
      layer: true,
      data: {
        isFinger: this._target === Tw.FIDO_TYPE.FINGER
      }
    }, $.proxy(this._onOpenBioRegister, this), $.proxy(this._onCloseBioRegister, this), 'register');
  },
  _onOpenBioRegister: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-register-finger', $.proxy(this._onClickRegister, this));
    $popupContainer.on('click', '#fe-bt-register-face', $.proxy(this._onClickRegister, this));
  },
  _onClickRegister: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_REGISTER, {}, $.proxy(this._onFidoRegister, this));
  },
  _onFidoRegister: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._complete = true;
      this._popupService.closeAll();
    } else {
      Tw.Error(resp.resultCode, 'error').pop();
    }
  },
  _onCloseBioRegister: function () {
    if ( this._complete ) {
      this._biometricsComplete.open();
    }
  }
};
