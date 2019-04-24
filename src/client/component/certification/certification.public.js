/**
 * @file certification.public.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.08.20
 */

/**
 * @class
 * @desc 공통 > 인증 > 공인인증
 * @constructor
 */
Tw.CertificationPublic = function () {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._authUrl = null;
  this._command = null;
  this._callback = null;
  this._authKind = null;
  this._prodAuthKey = null;

  this.$termsConfirm = null;
  this._termsConfirm = false;
};


Tw.CertificationPublic.prototype = {
  /**
   * @member {object}
   * @desc 에러 코드
   * @readonly
   * @prop {string} CANCEL 사용자 취소
   */
  ERROR_CODE: {
    CANCEL: 9
  },

  /**
   * @function
   * @desc 공인인증 요청
   * @param authUrl
   * @param authKind
   * @param prodAuthKey
   * @param command
   * @param callback
   */
  open: function (authUrl, authKind, prodAuthKey, command, callback) {
    this._authUrl = authUrl;
    this._authKind = authKind;
    this._prodAuthKey = prodAuthKey;
    this._command = command;
    this._callback = callback;

    this._openTerms();
  },

  /**
   * @function
   * @desc 공인인증 약관동의 팝업 요청
   * @private
   */
  _openTerms: function () {
    this._popupService.open({
      hbs: 'CO_CE_02_04_01_01',
      layer: true
    }, $.proxy(this._onOpenTerms, this), $.proxy(this._onCloseTerms, this));
  },

  /**
   * @function
   * @desc 공인인증 약관동의 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenTerms: function ($popupContainer) {
    Tw.CommonHelper.focusOnActionSheet($popupContainer);

    this.$termsConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$termsConfirm.on('click', _.debounce($.proxy(this._onClickTermsConfirm, this), 500));
    $popupContainer.on('change', '#fe-check-terms', $.proxy(this._onCheckTerms, this));
  },

  /**
   * @function
   * @desc 공인인증 약관동의 팝업 클로즈 콜백
   * @private
   */
  _onCloseTerms: function () {
    if ( this._termsConfirm ) {
      this._requestAppMessage(this._authUrl);
    }
  },

  /**
   * @function
   * @desc 공인인증 약관 체크박스 이벤트 처리
   * @param $event
   * @private
   */
  _onCheckTerms: function ($event) {
    var $target = $($event.currentTarget);
    if ( $target.prop('checked') ) {
      this.$termsConfirm.attr('disabled', false);
    } else {
      this.$termsConfirm.attr('disabled', true);
    }
  },

  /**
   * @function
   * @desc 공인인증 약관동의 확인 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickTermsConfirm: function () {
    this._termsConfirm = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 공인인증 앱메시지 요청
   * @param authUrl
   * @private
   */
  _requestAppMessage: function (authUrl) {
    this._apiService.request(Tw.API_CMD.BFF_01_0035, {
      authUrl: authUrl
    }).done($.proxy(this._successAppMessage, this))
      .fail($.proxy(this._failAppMessage, this));
  },

  /**
   * @function
   * @desc 공인인증 앱메시지 응답 처리
   * @param resp
   * @private
   */
  _successAppMessage: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openPublicCert(this._setAppMsg(resp.result));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 공인인증 앱메시지 실패 처
   * @param error
   * @private
   */
  _failAppMessage: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 공인인증 요청
   * @param message
   */
  _openPublicCert: function (message) {
    this._nativeService.send(Tw.NTV_CMD.AUTH_CERT, {
      message: message,
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._prodAuthKey : ''
    }, $.proxy(this._onPublicCert, this));
  },

  /**
   * @function
   * @desc 공인인증 완료 처리
   * @param resp
   * @private
   */
  _onPublicCert: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._setComplete();
    } else if ( resp.resultCode === this.ERROR_CODE.CANCEL ) {
      this._callback({ code: Tw.API_CODE.CERT_CANCEL });
    } else {
      this._callback({
        code: Tw.API_CODE.CERT_FAIL,
        msg: Tw.ALERT_MSG_COMMON.CERT_FAIL
      });
    }
  },

  /**
   * @function
   * @desc 앱메시지 파싱
   * @param result
   * @returns {string}
   * @private
   */
  _setAppMsg: function (result) {
    this._certMethod = result.certMethod;
    if ( this._certMethod !== Tw.AUTH_CERTIFICATION_METHOD.FINANCE_AUTH ) {
      return '';
    }
    if ( this._needAccountInfo(this._command.command.path) ) {
      return Tw.PUBLIC_AUTH_COP + ',' + this._command.params.bankOrCardName + ',' +
        this._command.params.bankOrCardAccn + ',' + result.custName + ',' + result.birthDate;
    }
    return result.custName + ',' + result.birthDate;
  },

  /**
   * @function
   * @desc 계정정보 필요 API 인지 확인
   * @param path
   * @returns {boolean}
   * @private
   */
  _needAccountInfo: function (path) {
    if ( path === '/bypass/core-bill/v1/bill-pay/settle-pay-bank' ||
      path === '/bypass/core-bill/v1/bill-pay/settle-pay-card' ) {
      return true;
    }
    return false;
  },

  /**
   * @function
   * @desc 공인인증 성공 BFF 처리
   * @private
   */
  _setComplete: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0026, {
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._prodAuthKey : ''
    }).done($.proxy(this._successComplete, this))
      .fail($.proxy(this._failComplete, this));
  },

  /**
   * @function
   * @desc BFF 인증 응답 처리
   * @param resp
   * @private
   */
  _successComplete: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._callback(resp);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc BFF 인증 실패 처리
   * @param error
   * @private
   */
  _failComplete: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  }
};
