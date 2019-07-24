/**
 * @file certification.bio.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.11
 */

/**
 * @class
 * @desc 공통 > 인증 > 생체인증
 * @constructor
 */
Tw.CertificationBio = function () {
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;

  this._callback = null;
  this._authUrl = null;
  this._authKind = null;
  this._prodAuthKey = null;
  this._register = false;
  this._target = '';
};


Tw.CertificationBio.prototype = {
  /**
   * @member {object}
   * @desc 에러 코드
   * @readonly
   * @prop {string} FAIL 실패
   * @prop {string} CANCEL 사용자 취소
   * @prop {string} LOCK 계정잠
   */
  ERROR_CODE: {
    FAIL: 9,
    CANCEL: 258,
    LOCK: 259
  },

  /**
   * @function
   * @desc 생체인증 요청
   * @param authUrl
   * @param authKind
   * @param prodAuthKey
   * @param svcInfo
   * @param callback
   * @param isRegister
   * @param target
   */
  open: function (authUrl, authKind, prodAuthKey, svcInfo, callback, isRegister, target) {
    this._callback = callback;
    this._authUrl = authUrl;
    this._authKind = authKind;
    this._prodAuthKey = prodAuthKey;
    this._svcInfo = svcInfo;
    this._target = target;

    if ( isRegister ) {
      this._fidoAuth();
    } else {
      this._openRegisterPopup();
    }
  },

  /**
   * @function
   * @desc 생체인증 등록 확인 팝업 요청
   * @private
   */
  _openRegisterPopup: function () {
    this._popupService.openConfirmButton(Tw.POPUP_CONTENTS.BIO_REGISTER, null,
      $.proxy(this._onConfirmRegister, this), $.proxy(this._onCloseRegister, this),
      Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  },

  /**
   * @function
   * @desc 생체인증 등록 확인 팝업 확인 버튼 클릭 이벤트 처리
   * @private
   */
  _onConfirmRegister: function () {
    this._register = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 생체인증 등록 확인 팝업 close callback
   * @private
   */
  _onCloseRegister: function () {
    if ( this._register ) {
      this._goBioRegister();
    }
  },

  /**
   * @function
   * @desc 생체인증 등록 요청
   * @private
   */
  _goBioRegister: function () {
    var biometricsTerm = new Tw.BiometricsTerms(this._svcInfo.mbrChlId);
    biometricsTerm.open($.proxy(this._onFidoRegister, this));
  },

  /**
   * @function
   * @desc 생체인증 요청
   * @private
   */
  _fidoAuth: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_AUTH, {
      authUrl: this._authUrl,
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._prodAuthKey : '',
      svcMgmtNum: this._svcInfo.mbrChlId
    }, $.proxy(this._onFidoAuth, this));
  },

  /**
   * @function
   * @desc 생체인증 완료 콜백
   * @param resp
   * @private
   */
  _onFidoAuth: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._callback({
        code: Tw.API_CODE.CODE_00
      });
    } else if ( resp.resultCode === this.ERROR_CODE.CANCEL ) {
      this._callback({ code: Tw.API_CODE.CERT_SELECT, target: Tw.AUTH_CERTIFICATION_METHOD.BIO });
    } else {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.BIOMETRICS_CERT_FAIL);
      // Tw.Error(resp.resultCode, resp.errorMessage).pop();
    }
  },

  /**
   * @function
   * @desc 생체인증 등록 콜백
   * @param resp
   * @private
   */
  _onFidoRegister: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._fidoAuth();
    }
  }
};
