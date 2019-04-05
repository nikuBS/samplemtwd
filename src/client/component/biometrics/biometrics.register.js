/**
 * @file biometrics.register.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.10
 */

Tw.BiometricsRegister = function (target, userId) {
  this._target = target;
  this._userId = userId;
  this._callback = null;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._complete = false;
};

Tw.BiometricsRegister.prototype = {
  RESULT: {
    COMPLETE: '00',
    CANCEL: '01'
  },
  ERROR_CODE: {
    CANCEL: 9
  },
  open: function (callback, closeCallback) {
    this._callback = callback;
    this._closeCallback = closeCallback;
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

    this.$infoIng = $popupContainer.find('.fe-info-ing');
    this.$infoClick = $popupContainer.find('.fe-info-click');
    this._nativeService.send(Tw.NTV_CMD.FIDO_REGISTER, { svcMgmtNum: this._userId }, $.proxy(this._onFidoRegister, this));
  },
  _onClickCancel: function () {
    this._allClose = true;
    this._popupService.close();
  },
  _onClickRegister: function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.$infoClick.addClass('none');
    this.$infoIng.removeClass('none');
    this._nativeService.send(Tw.NTV_CMD.FIDO_REGISTER, { svcMgmtNum: this._userId }, $.proxy(this._onFidoRegister, this));
  },
  _onFidoRegister: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._complete = true;
      // this._popupService.closeAll();
      this._popupService.close();
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.FIDO_USE + ':' + this._userId,
        value: 'Y'
      });
    } else if ( resp.resultCode === this.ERROR_CODE.CANCEL ) {
      Tw.Logger.log('[FIDO] Cancel');
      this.$infoIng.addClass('none');
      this.$infoClick.removeClass('none');
    } else {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.BIOMETRICS_REGISTER_FAIL);
      // Tw.Error(resp.resultCode, 'error').pop();
    }
  },
  _onCloseBioRegister: function () {
    if ( this._complete ) {
      if ( !Tw.FormatHelper.isEmpty(this._closeCallback) ) {
        this._closeCallback(this.RESULT.COMPLETE);
      }
    } else {
      if ( this._allClose && !Tw.FormatHelper.isEmpty(this._closeCallback) ) {
        this._closeCallback(this.RESULT.CANCEL);
      }
    }
  }
};
