/**
 * FileName: main.menu.settings.biometrics.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.10
 */

Tw.MainMenuSettingsBiometrics = function (rootEl, target) {
  this.$container = rootEl;
  this._target = target;

  this._nativeService = Tw.Native;

  this.$inputFido = null;
  this.$txtFido = null;
  this.$btCancel = null;

  this._bindEvent();
  this._checkFido();
};

Tw.MainMenuSettingsBiometrics.prototype = {
  _bindEvent: function () {
    this.$txtFido = this.$container.find('#fe-txt-' + this._target);
    this.$btCancel = this.$container.find('#fe-bt-cancel-' + this._target);
    this.$inputFido = this.$container.find('#fe-input-set-' + this._target);

    this.$btCancel.on('click', $.proxy(this._onClickCancelFido, this));
    this.$inputFido.on('change', $.proxy(this._onChangeFidoUse, this));
    this.$container.on('click', '#fe-bt-register-' + this._target, $.proxy(this._onClickRegisterFido, this));
  },
  _checkFido: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_CHECK, {}, $.proxy(this._onFidoCheck, this));
  },
  _onClickRegisterFido: function () {
    var biometricsTerm = new Tw.BiometricsTerms(this._target);
    biometricsTerm.open($.proxy(this._updateFidoInfo, this));
  },
  _onClickCancelFido: function () {
    var biometricsDeregister = new Tw.BiometricsDeregister(this._target);
    biometricsDeregister.openPopup($.proxy(this._updateFidoInfo, this));
  },
  _onFidoCheck: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( this._target === Tw.FIDO_TYPE.FINGER ) {
        this._setEnableStatus(Tw.NTV_FIDO_REGISTER_TXT.FINGER_ON);
      } else {
        this._setEnableStatus(Tw.NTV_FIDO_REGISTER_TXT.FACE_ON);
      }
      this._nativeService.send(Tw.NTV_CMD.LOAD, { key: Tw.NTV_STORAGE.FIDO_USE }, $.proxy(this._onFidoUse, this));
    } else {
      if ( this._target === Tw.FIDO_TYPE.FINGER ) {
        this._setDisableStatus(Tw.NTV_FIDO_REGISTER_TXT.FINGER_OFF);
      } else {
        this._setDisableStatus(Tw.NTV_FIDO_REGISTER_TXT.FACE_OFF);
      }
    }
  },
  _onFidoUse: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( resp.params.value === Tw.NTV_FIDO_USE.ENABLE ) {
        this.$inputFido.attr('checked', true);
        this.$inputFido.parents('.fe-switch').addClass('on');
      } else {
        this.$inputFido.attr('checked', false);
        this.$inputFido.parents('.fe-switch').removeClass('on');
      }
    } else {
      this.$inputFido.attr('checked', false);
      this.$inputFido.parents('.fe-switch').removeClass('on');
    }
  },
  _onChangeFidoUse: function ($event) {
    if ( $($event.currentTarget).attr('checked') === 'checked' ) {
      // off
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.FIDO_USE,
        value: Tw.NTV_FIDO_USE.DISABLE
      });
      Tw.CommonHelper.toast(Tw.TOAST_TEXT.FIDO_NOT_USE);
    } else {
      // on
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.FIDO_USE,
        value: Tw.NTV_FIDO_USE.ENABLE
      });
      Tw.CommonHelper.toast(Tw.TOAST_TEXT.FIDO_USE);
    }
  },
  _setEnableStatus: function (str) {
    this.$txtFido.text(str);
    this.$btCancel.attr('disabled', false);
    this.$btCancel.parents('.fe-cancel').removeClass('disabled');
    this.$inputFido.parents('.fe-switch').removeClass('disabled');
    this.$inputFido.attr('disabled', false);
    this.$inputFido.parents('.fe-checkbox').attr('aria-disabled', false);
    this.$inputFido.parents('.fe-setting').removeClass('disabled');
  },
  _setDisableStatus: function (str) {
    this.$txtFido.text(str);
    this.$btCancel.attr('disabled', true);
    this.$btCancel.parents('.fe-cancel').addClass('disabled');
    this.$inputFido.parents('.fe-switch').addClass('disabled');
    this.$inputFido.attr('disabled', true);
    this.$inputFido.parents('.fe-checkbox').attr('aria-disabled', true);
    this.$inputFido.parents('.fe-setting').addClass('disabled');

    this.$inputFido.attr('checked', false);
    this.$inputFido.parents('.fe-switch').removeClass('on');
  },
  _updateFidoInfo: function () {
    this._checkFido();
  }
};
