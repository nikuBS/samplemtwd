/**
 * FileName: biometrics.register.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.10
 */

Tw.BiometricsRegister = function (target) {
  this._target = target;
  this._callback = null;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._complete = false;
};

Tw.BiometricsRegister.prototype = {
  ERROR_CODE: {
    CANCEL: 258
  },
  open: function (callback) {
    this._callback = callback;
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
    $popupContainer.on('click', '#fe-cancel', $.proxy(this._onClickCancel, this));
    this._nativeService.send(Tw.NTV_CMD.FIDO_REGISTER, {}, $.proxy(this._onFidoRegister, this));
  },
  _onClickCancel: function () {
    this._popupService.closeAll();
  },
  _onClickRegister: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_REGISTER, {}, $.proxy(this._onFidoRegister, this));
  },
  _onFidoRegister: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._complete = true;
      this._popupService.closeAll();
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.FIDO_USE,
        value: Tw.NTV_FIDO_USE.ENABLE
      });
    } else if ( resp.resultCode === this.ERROR_CODE.CANCEL ) {
      Tw.Logger.log('[FIDO] Cancel');
    } else {
      Tw.Error(resp.resultCode, 'error').pop();
    }
  },
  _onCloseBioRegister: function () {
    if ( this._complete ) {
      setTimeout($.proxy(function () {
        var biometricsComplete = new Tw.BiometricsComplete(this._target);
        biometricsComplete.open(this._callback);
      }, this), 100);
    }
  }
};
