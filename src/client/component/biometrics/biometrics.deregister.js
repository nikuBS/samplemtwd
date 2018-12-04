/**
 * FileName: biometrics.deregister.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.30
 */

Tw.BiometricsDeregister = function () {
  this._popupService = Tw.Popup;
};

Tw.BiometricsDeregister.prototype = {
  open: function () {
    this._popupService.open({
      hbs: 'MA_03_01_02_01_05',
      layer: true,
      data: {
        isFinger: this._target === Tw.FIDO_TYPE.FINGER
      }
    }, $.proxy(this._onOpenBioDeRegister, this), null, 'deregister');
  },
  _onOpenBioDeRegister: function ($popupContainer) {
  }
};
