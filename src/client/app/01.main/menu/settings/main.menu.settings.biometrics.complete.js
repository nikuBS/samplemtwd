/**
 * FileName: main.menu.settings.biometrics.complete.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.30
 */

Tw.MainMenuSettingsBiometricsComplete = function () {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
};

Tw.MainMenuSettingsBiometricsComplete.prototype = {
  open: function () {
    this._popupService.open({
      hbs: 'MA_03_01_02_01_04',
      layer: true,
      data: {
        isFinger: this._target === Tw.FIDO_TYPE.FINGER
      }
    }, $.proxy(this._onOpenBioComplete, this), $.proxy(this._onCloseBioCert, this), 'complete');
  },
  _onOpenBioComplete: function ($popupContainer) {
  }
};
