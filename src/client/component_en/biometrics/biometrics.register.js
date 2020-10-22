/**
 * @file biometrics.register.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.10
 */

/**
 * @class
 * @desc 설정 > 생체인증 > 등록
 * @param mbrChlId
 * @constructor
 */
Tw.BiometricsRegister = function (mbrChlId) {
  this._mbrChlId = mbrChlId;
  this._callback = null;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._complete = false;
};

Tw.BiometricsRegister.prototype = {
  /**
   * @member {object}
   * @desc 결과 코드
   * @readonly
   * @prop {string} COMPLETE 성공
   * @prop {string} CANCEL 사용자 취소
   */
  RESULT: {
    COMPLETE: '00',
    CANCEL: '01'
  },

  /**
   * @member {object}
   * @desc 에러코드
   * @readonly
   * @prop {string} CANCEL 사용자 취소
   */
  ERROR_CODE: {
    CANCEL: 9
  },

  /**
   * @function
   * @desc 생체인증 등록 요청
   * @param callback
   * @param closeCallback
   */
  open: function (callback, closeCallback) {
    this._callback = callback;
    this._closeCallback = closeCallback;
    this._popupService.open({
      hbs: 'MA_03_01_02_01_03',
      layer: true
    }, $.proxy(this._onOpenBioRegister, this), $.proxy(this._onCloseBioRegister, this), 'register');
  },

  /**
   * @function
   * @desc 등록 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenBioRegister: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-register-finger', $.proxy(this._onClickRegister, this));
    $popupContainer.on('click', '#fe-bt-register-face', $.proxy(this._onClickRegister, this));
    $popupContainer.on('click', '#fe-cancel', $.proxy(this._onClickCancel, this));

    this.$infoIng = $popupContainer.find('.fe-info-ing');
    this.$infoClick = $popupContainer.find('.fe-info-click');
    this._nativeService.send(Tw.NTV_CMD.FIDO_REGISTER, { svcMgmtNum: this._mbrChlId }, $.proxy(this._onFidoRegister, this));
  },

  /**
   * @function
   * @desc 취소 버튼 click event 처리
   * @private
   */
  _onClickCancel: function () {
    this._allClose = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 등록 버튼 click event 처리
   * @param $event
   * @private
   */
  _onClickRegister: function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.$infoClick.addClass('none');
    this.$infoIng.removeClass('none');
    this._nativeService.send(Tw.NTV_CMD.FIDO_REGISTER, { svcMgmtNum: this._mbrChlId }, $.proxy(this._onFidoRegister, this));
  },

  /**
   * @function
   * @desc 생체인증 등록 응답 처리
   * @param resp
   * @private
   */
  _onFidoRegister: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._complete = true;
      // this._popupService.closeAll();
      this._popupService.close();
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.FIDO_USE + ':' + this._mbrChlId,
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

  /**
   * @function
   * @desc 등록 팝업 클로즈 콜백
   * @private
   */
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
