/**
 * FileName: common.biometrics.menu.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.10
 */

Tw.CommonBiometricsMenu = function (rootEl, target) {
  this.$container = rootEl;
  this._target = target;

  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this.$inputFido = null;
  this.$txtFido = null;
  this.$btCancel = null;

  this._checkFido();
  this._bindEvent();
};

Tw.CommonBiometricsMenu.prototype = {
  _bindEvent: function () {
    this.$txtFido = this.$container.find('#fe-txt-' + this._target);
    this.$btCancel = this.$container.find('#fe-bt-cancel-' + this._target);
    this.$inputFido = this.$container.find('#fe-input-set-' + this._target);

    this.$btCancel.on('click', $.proxy(this._onClickCancelFido, this));
    this.$container.on('click', '#fe-bt-register-' + this._target , $.proxy(this._onClickRegisterFido, this));
  },
  _checkFido: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_CHECK, {}, $.proxy(this._onFidoCheck, this));
  },
  _onClickCancelFido: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_DEREGISTER, {}, $.proxy(this._onFidoDeRegister, this));

  },
  _onFidoCheck: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( this._target === Tw.FIDO_TYPE.FINGER ) {
        this._setEnableStatus(Tw.NTV_FIDO_REGISTER_TXT.FINGER_ON);
      } else {
        this._setEnableStatus(Tw.NTV_FIDO_REGISTER_TXT.FACE_ON);
      }
    } else {
      if ( this._target === Tw.FIDO_TYPE.FINGER ) {
        this._setDisableStatus(Tw.NTV_FIDO_REGISTER_TXT.FINGER_OFF);
      } else {
        this._setDisableStatus(Tw.NTV_FIDO_REGISTER_TXT.FACE_OFF);
      }
    }
  },
  _onFidoDeRegister: function (resp) {
    console.log(resp);
  },
  _onClickRegisterFido: function () {
    this._historyService.goLoad('/common/biometrics/terms?target=' + this._target);
  },
  _setEnableStatus: function(str) {
    this.$txtFido.text(str);
  },
  _setDisableStatus: function(str) {
    this.$txtFido.text(str);
    this.$btCancel.attr('disabled', true);
    this.$btCancel.parents('.fe-cancel').addClass('disabled');
    this.$inputFido.prop('checked', false);
    this.$inputFido.parents('.fe-switch').addClass('disabled');
    this.$inputFido.parents('.fe-switch').removeClass('on');
    this.$inputFido.attr('disabled', true);
    this.$inputFido.parents('.fe-checkbox').attr('aria-disabled', true);
    this.$inputFido.parents('.fe-setting').addClass('disabled');
  }
};
