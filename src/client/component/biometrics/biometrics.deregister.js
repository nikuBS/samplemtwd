/**
 * @file biometrics.deregister.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.30
 */

Tw.BiometricsDeregister = function (target, userId) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = Tw.HistoryService();

  this._target = target;
  this._userId = userId;
  this._cancelFido = false;
  this._goRegister = false;

  this._callback = null;
};

Tw.BiometricsDeregister.prototype = {
  ERROR_CODE: {
    COMPLETE: 9
  },
  openPopup: function (callback) {
    this._callback = callback;
    var content = this._target === Tw.FIDO_TYPE.FINGER ? Tw.POPUP_CONTENTS.BIO_FINGER_DEREGISTER : Tw.POPUP_CONTENTS.BIO_FACE_DEREGISTER;
    this._popupService.openConfirmButton(content, null, $.proxy(this._onConfirmCancelFido, this), $.proxy(this._onCloseCancelFido, this),
      Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  },
  _onConfirmCancelFido: function () {
    this._cancelFido = true;
    this._popupService.close();
  },
  _onCloseCancelFido: function () {
    if ( this._cancelFido ) {
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.FIDO_USE + ':' + this._userId,
        value: 'N'
      });
      this._nativeService.send(Tw.NTV_CMD.FIDO_DEREGISTER, { svcMgmtNum: this._userId }, $.proxy(this._onFidoDeRegister, this));
    }
  },
  _onFidoDeRegister: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 || resp.resultCode === this.ERROR_CODE.COMPLETE ) {
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.FIDO_USE + ':' + this._userId,
        value: 'N'
      });
      this._openComplete();
    } else {
      Tw.Error(resp.resultCode, resp.errorMessage).pop();
    }
  },
  _openComplete: function () {
    if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback();
    }
    this._popupService.open({
      hbs: 'MA_03_01_02_01_05',
      layer: true,
      data: {
        isFinger: this._target === Tw.FIDO_TYPE.FINGER
      }
    }, $.proxy(this._onOpenBioDeRegister, this), $.proxy(this._onCloseBioDeRegister, this), 'deregister');
  },
  _onOpenBioDeRegister: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-go-register-' + this._target, $.proxy(this._onClickRegisterFido, this));
  },
  _onClickRegisterFido: function () {
    this._goRegister = true;
    this._popupService.close();
  },
  _onCloseBioDeRegister: function () {
    if ( this._goRegister ) {
      this._biometricsTerm = new Tw.BiometricsTerms(this._target, this._userId);
      this._biometricsTerm.open(this._callback);
    }
  }
};
