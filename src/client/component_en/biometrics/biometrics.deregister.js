/**
 * @file biometrics.deregister.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.30
 */

/**
 * @class
 * @desc 설정 > 생체인증 > 등록 해제
 * @param mbrChlId
 * @constructor
 */
Tw.BiometricsDeregister = function (mbrChlId) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = Tw.HistoryService();

  this._mbrChlId = mbrChlId;
  this._cancelFido = false;
  this._goRegister = false;

  this._callback = null;
};

Tw.BiometricsDeregister.prototype = {
  /**
   * @member {object}
   * @desc 에러 코드
   * @readonly
   * @prop {string} COMPLETE 성공
   */
  ERROR_CODE: {
    COMPLETE: 9
  },

  /**
   * @function
   * @desc 생체인증 등록 해제 요청
   * @param callback
   */
  openPopup: function (callback) {
    this._callback = callback;
    this._popupService.openConfirmButton(Tw.POPUP_CONTENTS.BIO_DEREGISTER, null, $.proxy(this._onConfirmCancelFido, this), $.proxy(this._onCloseCancelFido, this),
      Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  },

  /**
   * @function
   * @desc 생체인증 등록 해제 확인 버튼 click event 처리 (등록 해제 요청)
   * @private
   */
  _onConfirmCancelFido: function () {
    this._cancelFido = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 생체인증 등록 해제 확인 팝업 클로즈 콜백
   * @private
   */
  _onCloseCancelFido: function () {
    if ( this._cancelFido ) {
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.FIDO_USE + ':' + this._mbrChlId,
        value: 'N'
      });
      this._nativeService.send(Tw.NTV_CMD.FIDO_DEREGISTER, { svcMgmtNum: this._mbrChlId }, $.proxy(this._onFidoDeRegister, this));
    }
  },

  /**
   * @function
   * @desc 생체인증 해제 응답 처리
   * @param resp
   * @private
   */
  _onFidoDeRegister: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 || resp.resultCode === this.ERROR_CODE.COMPLETE ) {
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.FIDO_USE + ':' + this._mbrChlId,
        value: 'N'
      });
      this._openComplete();
    } else {
      Tw.Error(resp.resultCode, resp.errorMessage).pop();
    }
  },

  /**
   * @function
   * @desc 생체인증 해제완료 팝업 오픈
   * @private
   */
  _openComplete: function () {
    if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback();
    }
    this._popupService.open({
      hbs: 'MA_03_01_02_01_05',
      layer: true
    }, $.proxy(this._onOpenBioDeRegister, this), $.proxy(this._onCloseBioDeRegister, this), 'deregister');
  },

  /**
   * @function
   * @desc 생체인증 해제완료 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenBioDeRegister: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-go-register-fido', $.proxy(this._onClickRegisterFido, this));
  },

  /**
   * @function
   * @desc 등록 버튼 click event 처리
   * @private
   */
  _onClickRegisterFido: function () {
    this._goRegister = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 생체인증 해제완료 팝업 클로즈 콜백
   * @private
   */
  _onCloseBioDeRegister: function () {
    if ( this._goRegister ) {
      this._biometricsTerm = new Tw.BiometricsTerms(this._mbrChlId);
      this._biometricsTerm.open(this._callback);
    }
  }
};
