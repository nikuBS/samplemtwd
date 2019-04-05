/**
 * FileName: biometrics.complete.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.30
 */

Tw.BiometricsComplete = function (target) {
  this._target = target;
  this._callback = null;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
};

Tw.BiometricsComplete.prototype = {
  open: function (callback) {
    this._callback = callback;

    this._popupService.open({
      hbs: 'MA_03_01_02_01_04',
      layer: true,
      data: {
        isFinger: this._target === Tw.FIDO_TYPE.FINGER
      }
    }, $.proxy(this._onOpenBioComplete, this), $.proxy(this._onCloseBioCert, this), 'complete');
  },
  _onOpenBioComplete: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-complete', $.proxy(this._onClickComplete, this));
  },
  _onCloseBioCert: function () {
    if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback({ code: Tw.API_CODE.CODE_00 });
    }
  },
  _onClickComplete: function () {
    this._popupService.close();
  }

};
