/**
 * @file biometrics.cert.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.13
 */

/**
 * @class
 * @desc 설정 > 생체인증 > 본인확인
 * @param userId
 * @constructor
 */
Tw.BiometricsCert = function (userId) {
  this._userId = userId;
  this._callback = null;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._svcInfo = null;
  this._authUrl = 'GET|/v1/dummy/auth';
  this._authKind = Tw.AUTH_CERTIFICATION_KIND.P;

  this._getSvcInfo();
};

Tw.BiometricsCert.prototype = {
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
   * @function
   * @desc 생체 인증 본인확인 페이지 요청
   * @param callback
   * @param closeCallback
   */
  open: function (callback, closeCallback) {
    this._callback = callback;
    this._closeCallback = closeCallback;

    this._getMethodBlock();
  },

  /**
   * @function
   * @desc 2차인증 차단 여부 API 요청
   * @private0
   */
  _getMethodBlock: function () {
    this._apiService.request(Tw.NODE_CMD.GET_AUTH_METHOD_BLOCK, {})
      .done($.proxy(this._successGetAuthMethodBlock, this))
      .fail($.proxy(this._failGetAuthMethodBlock, this));
  },

  /**
   * @function
   * @desc 2차인증 차단 여부 API 응답 처리
   * @param resp
   * @private
   */
  _successGetAuthMethodBlock: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._authBlock = this._parseAuthBlock(resp.result);
    }
    this._openPopup();
  },

  /**
   * @function
   * @desc 2차인증 차단 여부 API 실패 처리
   * @param error
   * @private
   */
  _failGetAuthMethodBlock: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 2차인증 차단 여부 파싱
   * @param list
   * @private
   */
  _parseAuthBlock: function (list) {
    var block = {};
    var today = new Date().getTime();
    _.map(list, $.proxy(function (target) {
      var startTime = Tw.DateHelper.convDateFormat(target.fromDtm).getTime();
      var endTime = Tw.DateHelper.convDateFormat(target.toDtm).getTime();
      if ( today > startTime && today < endTime ) {
        block[target.authMethodCd] = 'Y';
      } else {
        block[target.authMethodCd] = 'N';
      }
    }, this));
    return block;
  },

  /**
   * @function
   * @desc 본인확인 팝업 요청
   * @private
   */
  _openPopup: function () {
    var methods = {
      skSms: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SK_SMS] === 'Y'
      },
      otherSms: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS] === 'Y'
      },
      ipin: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.IPIN] === 'Y'
      },
      publicCert: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH] === 'Y'
      }
    };

    var checkBlock = _.find(methods, $.proxy(function (method) {
      return !method.block;
    }, this));

    if ( Tw.FormatHelper.isEmpty(checkBlock) ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE);
      return;
    }

    this._popupService.open({
      hbs: 'MA_03_01_02_01_02',
      layer: true,
      data: {
        methods: methods
      }
    }, $.proxy(this._onOpenBioCert, this), $.proxy(this._onCloseBioCert, this), 'cert');
  },

  /**
   * @function
   * @desc 본인확인 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenBioCert: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', _.debounce($.proxy(this._onClickSkSms, this), 500));
    $popupContainer.on('click', '#fe-bt-kt', _.debounce($.proxy(this._onClickKtSms, this), 500));
    $popupContainer.on('click', '#fe-bt-lg', _.debounce($.proxy(this._onClickLgSms, this), 500));
    $popupContainer.on('click', '#fe-bt-ipin', _.debounce($.proxy(this._onClickIpin, this), 500));
    $popupContainer.on('click', '#fe-bt-public', _.debounce($.proxy(this._onClickPublic, this), 500));
    $popupContainer.on('click', '#fe-cancel', _.debounce($.proxy(this._onClickCancel, this), 500));
  },

  /**
   * @function
   * @desc 본인확인 팝업 클로즈 콜백
   * @private
   */
  _onCloseBioCert: function () {
    if ( this._allClose && !Tw.FormatHelper.isEmpty(this._closeCallback) ) {
      this._closeCallback(this._closeCode);
    }
  },

  /**
   * @function
   * @desc 취소 버튼 event 처리
   * @private
   */
  _onClickCancel: function () {
    // this._popupService.closeAll();
    this._allClose = true;
    if ( !Tw.FormatHelper.isEmpty(this._closeCallback) ) {
      this._closeCallback(this._closeCode);
    }
  },

  /**
   * @function
   * @desc 세션정보 API 요청
   * @private
   */
  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successSvcInfo, this))
      .fail($.proxy(this._failSvcInfo, this));
  },

  /**
   * @function
   * @desc 세션정보 API 응답 처리
   * @param resp
   * @private
   */
  _successSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = resp.result;
    }
  },

  /**
   * @function
   * @desc 세션정보 API 실패 처리
   * @private
   */
  _failSvcInfo: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc SK SMS 인증 click event 처리
   * @private
   */
  _onClickSkSms: function () {
    this._certSk = new Tw.CertificationSk();
    this._certSk.open(
      this._svcInfo, this._authUrl, this._authKind, '', $.proxy(this._completeIdentification, this), '', '', false, 1);
  },

  /**
   * @function
   * @desc KT SMS 인증 click event 처리
   * @private
   */
  _onClickKtSms: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(
      this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.KT, null, $.proxy(this._completeIdentification, this));
  },

  /**
   * @function
   * @desc LG SMS 인증 click event 처리
   * @private
   */
  _onClickLgSms: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(
      this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.LG, null, $.proxy(this._completeIdentification, this));
  },

  /**
   * @function
   * @desc 아이핀 인증 click event 처리
   * @private
   */
  _onClickIpin: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.IPIN, this._niceKind, null, $.proxy(this._completeIdentification, this));
  },

  /**
   * @function
   * @desc 공인인증 click event 처리
   * @private
   */
  _onClickPublic: function () {
    this._certPublic = new Tw.CertificationPublic();
    this._certPublic.open(this._authUrl, this._authKind, null, null, $.proxy(this._completeIdentification, this));
  },

  /**
   * @function
   * @desc 인증완료 callback
   * @param resp
   * @private
   */
  _completeIdentification: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var biometricsRegister = new Tw.BiometricsRegister(this._userId);
      biometricsRegister.open(this._callback, $.proxy(this._onCloseCallback, this));
    } else if ( resp.code === Tw.API_CODE.CERT_SMS_BLOCK ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_SMS_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_SMS_BLOCK.TITLE, Tw.BUTTON_LABEL.CLOSE);
    } else if ( resp.code === Tw.API_CODE.CERT_CANCEL ) {

    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 생체인증 등록 완료 callback
   * @param code
   * @private
   */
  _onCloseCallback: function (code) {
    this._allClose = true;
    this._closeCode = code;
    this._popupService.close();
  }
};
