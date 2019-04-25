/**
 * @file certification.finance.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.10
 */

/**
 * @class
 * @desc 공통 > 인증 > 금융거래인
 * @constructor
 */
Tw.CertificationFinance = function () {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._svcInfo = null;
  this._authUrl = null;
  this._callback = null;
  this._authKind = null;
  this._prodAuthKey = null;
  this._command = null;
  this._isCompleteIden = false;
  this._isCheckTerm = true;
  this._fidoTarget = '';
  this._result = null;

  this.$privacyCheck = null;
};


Tw.CertificationFinance.prototype = {
  /**
   * @member {object}
   * @desc 생체인증타입
   * @readonly
   * @prop {string} 0 지문인증
   * @prop {string} 1 얼굴인
   */
  FIDO_TYPE: {
    '0': Tw.FIDO_TYPE.FINGER,
    '1': Tw.FIDO_TYPE.FACE
  },

  /**
   * @function
   * @desc 금융거래인증 요청
   * @param svcInfo
   * @param authUrl
   * @param authKind
   * @param prodAuthKey
   * @param command
   * @param authBlock
   * @param callback
   */
  open: function (svcInfo, authUrl, authKind, prodAuthKey, command, authBlock, callback) {
    this._svcInfo = svcInfo;
    this._authUrl = authUrl;
    this._callback = callback;
    this._authKind = authKind;
    this._prodAuthKey = prodAuthKey;
    this._command = command;
    this._authBlock = authBlock;

    if ( this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH] === 'Y' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE);
      return;
    }
    this._fidoType();
  },

  /**
   * @function
   * @desc 생체인증 사용가능 여부 요청
   * @private
   */
  _fidoType: function () {
    // this._nativeService.send(Tw.NTV_CMD.FIDO_TYPE, {}, $.proxy(this._onFidoType, this));
    this._openFinance(false);
  },

  /**
   * @function
   * @desc 생체인증 사용가능 여부 처리
   * @param resp
   * @private
   */
  _onFidoType: function (resp) {
    var enableFido = false;
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 || resp.resultCode === Tw.NTV_CODE.CODE_01 ) {
      enableFido = true;
      this._fidoTarget = this.FIDO_TYPE[resp.resultCode];
    }
    this._openFinance(enableFido);
  },

  /**
   * @function
   * @desc 본인인증 팝업 호출
   * @param enableFido
   * @private
   */
  _openFinance: function (enableFido) {
    var methods = {
      skSms: {
        use: true,
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SK_SMS] === 'Y'
      },
      otherSms: {
        use: true,
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS] === 'Y'
      },
      ipin: {
        use: true,
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.IPIN] === 'Y'
      },
      bio: {
        use: enableFido,
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.BIO] === 'Y'
      }
    };

    var checkBlock = _.find(methods, $.proxy(function (method) {
      return method.use && !method.block;
    }, this));

    if ( Tw.FormatHelper.isEmpty(checkBlock) ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE);
      return;
    }

    this._popupService.open({
      hbs: 'CO_02_02_01',
      layer: true,
      data: {
        methods: methods
      }
    }, $.proxy(this._onOpenFinancePopup, this), $.proxy(this._onCloseFinancePopup, this), 'finance');
  },

  /**
   * @function
   * @desc 본인인증 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenFinancePopup: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-sk', _.debounce($.proxy(this._onClickSkSms, this), 500));
    $popupContainer.on('click', '#fe-bt-kt', _.debounce($.proxy(this._onClickKtSms, this), 500));
    $popupContainer.on('click', '#fe-bt-lg', _.debounce($.proxy(this._onClickLgSms, this), 500));
    $popupContainer.on('click', '#fe-bt-ipin', _.debounce($.proxy(this._onClickIpin, this), 500));
    $popupContainer.on('click', '#fe-bt-bio', _.debounce($.proxy(this._onClickBio, this), 500));
  },

  /**
   * @function
   * @desc 본인인증 팝업 클로즈 콜백
   * @private
   */
  _onCloseFinancePopup: function () {
    if ( !Tw.FormatHelper.isEmpty(this._result) ) {
      this._callback(this._result);
    } else {
      this._callback({ code: Tw.API_CODE.CERT_CANCEL });
    }
  },

  /**
   * @function
   * @desc SMS 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickSkSms: function () {
    this._certSkFull = new Tw.CertificationSkFull();
    this._certSkFull.open(this._authUrl, this._authKind, $.proxy(this._completeIdentification, this));
  },

  /**
   * @function
   * @desc KT 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickKtSms: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.KT, '',
      $.proxy(this._completeIdentification, this));
  },

  /**
   * @function
   * @desc LG 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickLgSms: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.LG, '',
      $.proxy(this._completeIdentification, this));
  },

  /**
   * @function
   * @desc IPIN 인증 클릭 이벤트 처리
   * @private
   */
  _onClickIpin: function () {
    this._certNice = new Tw.CertificationNice();
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.IPIN, null, '', $.proxy(this._completeIdentification, this));
  },

  /**
   * @function
   * @desc 생체 인증 클릭 이벤트 처리
   * @private
   */
  _onClickBio: function () {
    this._checkFido();
  },

  /**
   * @function
   * @desc 생체 인증 등록 여부 확인 요청
   * @private
   */
  _checkFido: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_CHECK, { svcMgmtNum: this._svcInfo.svcMgmtNum }, $.proxy(this._onCheckFido, this));
  },

  /**
   * @function
   * @desc 생체 인증 등록 여부 처리
   * @param resp
   * @private
   */
  _onCheckFido: function (resp) {
    this._certBio = new Tw.CertificationBio();
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._certBio.open(this._authUrl, this._authKind, this._prodAuthKey, this._svcInfo,
        $.proxy(this._completeIdentification, this), true, this._fidoTarget);
    } else {
      this._certBio.open(this._authUrl, this._authKind, this._prodAuthKey, this._svcInfo,
        $.proxy(this._completeIdentification, this), false, this._fidoTarget);
    }
  },

  /**
   * @function
   * @desc 본인인증 완료 처리
   * @param result
   * @private
   */
  _completeIdentification: function (result) {
    if ( result.code === Tw.API_CODE.CODE_00 ) {
      this._openPublic();
    } else {
      Tw.Error(result.code, result.msg).pop();
    }
  },

  /**
   * @function
   * @desc 공인인증 팝업 요청
   * @private
   */
  _openPublic: function () {
    this._popupService.open({
      hbs: 'CO_CE_02_05_02',
      layer: true
    }, $.proxy(this._onOpenPublicPopup, this), $.proxy(this._onClosePublicPopup, this), 'public-terms');
  },

  /**
   * @function
   * @desc 공인인증 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenPublicPopup: function ($popupContainer) {
    this.$privacyCheck = $popupContainer.find('#fe-cb-privacy');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');

    this.$privacyCheck.on('change', $.proxy(this._onChangePrivacy, this));
    this.$btConfirm.on('click', _.debounce($.proxy(this._onClickConfirm, this), 500));

    $popupContainer.on('click', '#fe-cancel', $.proxy(this._onClickCancel, this));
  },

  /**
   * @function
   * @desc 공인인증 팝업 클로즈 콜백
   * @private
   */
  _onClosePublicPopup: function () {
    if ( this._allClose ) {
      this._popupService.close();
    }
  },

  /**
   * @function
   * @desc 개인정보 이용동의 체크박스 변경 이벤트 처리
   */
  _onChangePrivacy: function () {
    if ( this.$privacyCheck.is(':checked') ) {
      this.$btConfirm.attr('disabled', false);
    } else {
      this.$btConfirm.attr('disabled', true);
    }
  },

  /**
   * @function
   * @desc 개인정보 이용동의 확인 버튼 이벤트 처리
   * @private
   */
  _onClickConfirm: function () {
    this._certPublic = new Tw.CertificationPublic();
    this._certPublic.open(this._authUrl, this._authKind, this._prodAuthKey, this._command, $.proxy(this._completePublicCert, this));
  },

  /**
   * @function
   * @desc 취소 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickCancel: function () {
    this._allClose = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 공인인증 완료 콜백
   * @param resp
   * @private
   */
  _completePublicCert: function (resp) {
    this._allClose = true;
    this._result = resp;
    this._popupService.close();
  }
};
