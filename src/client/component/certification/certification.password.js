/**
 * @file certification.password.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.08.20
 */

/**
 * @class
 * @desc 공통 > 인증 > 비밀번호 인
 * @constructor
 */
Tw.CertificationPassword = function () {
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._authUrl = null;
  this._callback = null;
  this._authKind = null;
  this._prodAuthKey = null;

  window.onPopupCallbackPassword = $.proxy(this._onPopupCallback, this);
};


Tw.CertificationPassword.prototype = {
  /**
   * @member {object}
   * @desc 에러코드
   * @readonly
   * @prop {string} CANCEL 사용자 취소
   * @prop {string} OVERCOUNT 횟수 초과
   */
  ERROR_CODE: {
    CANCEL: 1500,
    OVERCOUNT: 5011
  },

  /**
   * @function
   * @desc 비밀번호 인증 요청
   * @param authUrl
   * @param authKind
   * @param prodAuthKey
   * @param callback
   */
  open: function (authUrl, authKind, prodAuthKey, callback) {
    this._authUrl = authUrl;
    this._callback = callback;
    this._authKind = authKind;
    this._prodAuthKey = prodAuthKey;

    this._openCertPassword();
  },

  /**
   * @function
   * @desc 비밀번호 인증 페이지 요청 (App/Web 분기처리)
   * @private
   */
  _openCertPassword: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.CERT_PW, {}, $.proxy(this._onCertResult, this));
    } else {
      this._openCertBrowser();
    }
  },

  /**
   * @funcfion
   * @desc 도메인 요청
   * @private
   */
  _openCertBrowser: function () {
    this._apiService.request(Tw.NODE_CMD.GET_DOMAIN, {})
      .done($.proxy(this._successGetDomain, this))
      .fail($.proxy(this._failGetDomain));
  },

  /**
   * @function
   * @desc 도메인 요청 응답 처리 및 Web 비밀번호 인증 요청
   * @param resp
   * @private
   */
  _successGetDomain: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.openUrlInApp(resp.result.domain + '/common/tid/cert-pw', 'status=1,toolbar=1');
    }
  },

  /**
   * @function
   * @desc 도메인 요청 실패 처리
   * @param error
   * @private
   */
  _failGetDomain: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 비밀번호 인증 완료 콜백
   * @param resp
   * @private
   */
  _onCertResult: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._confirmPasswordCert();
    } else if ( resp.resultCode === this.ERROR_CODE.CANCEL || resp.resultCode === this.ERROR_CODE.OVERCOUNT ) {
      //
    } else {
      Tw.Error(resp.resultCode, resp.errorMessage).pop();
    }
  },

  /**
   * @function
   * @desc 비밀번호 인증 성공 BFF 처리
   * @private
   */
  _confirmPasswordCert: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0027, {
      type: Tw.AUTH_CERTIFICATION_METHOD.W,
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._prodAuthKey : ''
    }).done($.proxy(this._successConfirmPasswordCert, this))
      .fail($.proxy(this._failConfirmPasswordCert, this));
  },

  /**
   * @function
   * @desc BFF 인증 요청 응답 처리
   * @param resp
   * @private
   */
  _successConfirmPasswordCert: function (resp) {
    this._callback(resp);
  },

  /**
   * @function
   * @desc BFF 인증 요청 실패 처리
   * @param error
   * @private
   */
  _failConfirmPasswordCert: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc Web 비밀번호 인증 완료 callback
   * @private
   */
  _onPopupCallback: function () {
    this._confirmPasswordCert();
  }

};
