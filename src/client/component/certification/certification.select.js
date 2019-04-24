/**
 * @file certification.select.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.08.20
 */

/**
 * @class
 * @desc 공통 > 인증 > 인증 선택
 */
Tw.CertificationSelect = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._certMethod = null;
  this._openCert = false;
  this._niceKind = null;
  this._authKind = null;
  this._authBlock = '';

  this._opMethods = '';
  this._optMethods = '';
  this._methodCnt = 1;
  this._enableFido = false;
  this._registerFido = false;
  this._useFido = false;
  this._fidoTarget = '';

  this._svcInfo = null;
  this._certInfo = null;
  this._authUrl = null;
  this._command = null;
  this._deferred = null;
  this._callback = null;
  this._prodAuthKey = '';

  this._smsBlock = false;
  this._optionCert = false;
  this._onSelectPopup = false;

  this._certSk = new Tw.CertificationSk();
};


Tw.CertificationSelect.prototype = {
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
   * @desc 인증 선택 요청
   * @param certInfo
   * @param authUrl
   * @param command
   * @param deferred
   * @param callback
   */
  open: function (certInfo, authUrl, command, deferred, callback) {
    this._certInfo = certInfo;
    this._command = command;
    this._authUrl = authUrl;
    this._deferred = deferred;
    this._callback = callback;

    this._getSvcInfo();
  },

  /**
   * @function
   * @desc svcInfo API 요청
   * @private
   */
  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successGetSvcInfo, this))
      .fail($.proxy(this._failGetSvcInfo, this));
  },

  /**
   * @function
   * @desc svcInfo API 응답 처리
   * @param resp
   * @private
   */
  _successGetSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = resp.result;
      this._getMethodBlock();
    }
  },

  /**
   * @function
   * @desc svcInfo API 실패 처리
   * @param error
   * @private
   */
  _failGetSvcInfo: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc SMS 인증 점검 여부 확인
   * @private
   */
  _getMethodBlock: function () {
    this._apiService.request(Tw.NODE_CMD.GET_AUTH_METHOD_BLOCK, {})
      .done($.proxy(this._successGetAuthMethodBlock, this))
      .fail($.proxy(this._failGetAuthMethodBlock, this));
  },

  /**
   * @function
   * @desc SMS 인증 점검 여부 처리
   * @param resp
   * @private
   */
  _successGetAuthMethodBlock: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._authBlock = this._parseAuthBlock(resp.result);
    }
    this._selectKind();
  },

  /**
   * @function
   * @desc SMS 인증 점검 여부 실패 처리
   * @param error
   * @private
   */
  _failGetAuthMethodBlock: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc SMS 인증 점검 여부 파싱
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
   * @desc 인증 종류에 따른 처리
   * @private
   */
  _selectKind: function () {
    this._authKind = this._certInfo.authClCd;

    switch ( this._authKind ) {
      case Tw.AUTH_CERTIFICATION_KIND.R:  // 상품
        this._openProductCert();
        break;
      case Tw.AUTH_CERTIFICATION_KIND.A:  // 마스킹
        this._openMaskingCert();
        break;
      case Tw.AUTH_CERTIFICATION_KIND.P:  // 업무c
      case Tw.AUTH_CERTIFICATION_KIND.O:  // 업무 & 마스킹
        this._openBusinessCert();
        break;
      case Tw.AUTH_CERTIFICATION_KIND.F:  // 미환급금
        this._openRefundCert();
        break;
      default:
        Tw.Logger.error('[Cert] Not supported', this._authKind);
        break;
    }
  },

  /**
   * @function
   * @desc 생체인증 사용가능 여부 요청
   * @private
   */
  _fidoType: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_TYPE, {}, $.proxy(this._onFidoType, this));
  },

  /**
   * @function
   * @desc 생체인증 사용가능 여부 처리
   * @param resp
   * @private
   */
  _onFidoType: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 || resp.resultCode === Tw.NTV_CODE.CODE_01 ) {
      this._enableFido = true;
      this._fidoTarget = this.FIDO_TYPE[resp.resultCode];
      this._checkFido();
    } else {
      this._checkSmsPri();
    }
  },

  /**
   * @function
   * @desc 생체인증 등록 여부 요청
   * @private
   */
  _checkFido: function () {
    this._nativeService.send(Tw.NTV_CMD.FIDO_CHECK, { svcMgmtNum: this._svcInfo.userId }, $.proxy(this._onCheckFido, this));
  },

  /**
   * @function
   * @desc 생체인증 등록 여부 처리
   * @param resp
   * @private
   */
  _onCheckFido: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._registerFido = true;
      this._checkFidoUse();
    } else {
      this._checkSmsPri();
    }
  },

  /**
   * @function
   * @desc 생체인증 사용 여부 요청
   * @private
   */
  _checkFidoUse: function () {
    this._nativeService.send(Tw.NTV_CMD.LOAD, { key: Tw.NTV_STORAGE.FIDO_USE + ':' + this._svcInfo.userId }, $.proxy(this._onCheckFidoUse, this));
  },

  /**
   * @function
   * @desc 생체인증 사용 여부 처리
   * @param resp
   * @private
   */
  _onCheckFidoUse: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( resp.params.value === 'Y' ) {
        this._useFido = true;
        this._openCertPopup(Tw.AUTH_CERTIFICATION_METHOD.BIO);
      } else {
        this._checkSmsPri();
      }
    } else {
      this._checkSmsPri();
    }
  },

  /**
   * @function
   * @desc SMS 우선 사용 인증인지 확인
   * @private
   */
  _checkSmsPri: function () {
    if ( this._includeSkSms() && this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SK_SMS] !== 'Y' ) {
      this._openCertPopup(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS);
    } else {
      this._openSelectPopup(true);
    }
  },

  /**
   * @function
   * @desc 최초 인증 화면 분기
   * @private
   */
  _openOpCert: function () {
    if ( this._opMethods.indexOf(',') !== -1 ) {
      this._methodCnt = this._opMethods.split(',').length;
    }

    if ( this._methodCnt === 1 ) {
      if ( this._authBlock[this._opMethods] === 'Y' ) {
        this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE);
      } else {
        this._openCertPopup(this._opMethods);
      }
    } else {
      // 인증그룹2 인경우 App/Web 에 따라 FIDO/SMS 우선인증 체크필요
      if ( this._includeFido() && this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.BIO] !== 'Y' ) {
        this._fidoType();
      } else {
        this._checkSmsPri();
      }
    }
  },

  /**
   * @function
   * @desc 인증 수단에 FIDO가 있는지 확인
   * @returns {boolean}
   * @private
   */
  _includeFido: function () {
    return this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.BIO) !== -1;
  },

  /**
   * @function
   * @desc 인증 수단에 SK SMS가 있는지 확인
   * @returns {boolean}
   * @private
   */
  _includeSkSms: function () {
    return this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS) !== -1 ||
      this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE) !== -1;
  },

  /**
   * @function
   * @desc 마스킹 해제 인증 요청
   * @private
   */
  _openMaskingCert: function () {
    var methods = Tw.BrowserHelper.isApp() ? this._certInfo.mobileApp : this._certInfo.mobileWeb;
    this._opMethods = methods.opAuthMethods;
    this._optMethods = methods.optAuthMethods || '';
    this._openOpCert();
  },

  /**
   * @function
   * @desc 업무 인증 요청
   * @private
   */
  _openBusinessCert: function () {
    var methods = Tw.BrowserHelper.isApp() ? this._certInfo.mobileApp : this._certInfo.mobileWeb;
    if ( !Tw.FormatHelper.isEmpty(this._authKind) ) {
      this._opMethods = methods.opAuthMethods;
      this._optMethods = methods.optAuthMethods || '';
    }
    if ( !Tw.FormatHelper.isEmpty(this._optMethods) && this._optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PASSWORD) !== -1 ) {
      this._optionCert = true;
    }
    this._openOpCert();
  },

  /**
   * @function
   * @desc 상품 인증 요청
   * @private
   */
  _openProductCert: function () {
    this._prodAuthKey = this._certInfo.prodAuthKey;
    this._opMethods = this._certInfo.opAuthMethods;
    this._optMethods = this._certInfo.optAuthMethods;

    if ( !Tw.FormatHelper.isEmpty(this._optMethods) && this._optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PASSWORD) !== -1 ) {
      this._optionCert = true;
    }
    this._openOpCert();
  },

  /**
   * @function
   * @desc 미환급금 인증 요청
   * @private
   */
  _openRefundCert: function () {
    var methods = {
      skSms: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SK_SMS] === 'Y'
      },
      otherSms: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS] === 'Y'
      },
      save: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SAVE] === 'Y'
      },
      ipin: {
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.IPIN] === 'Y'
      }
    };
    this._popupService.open({
      hbs: 'CO_CE_02_01_refund',
      data: {
        methods: methods
      },
      layer: true
    }, $.proxy(this._opOpenRefundSelectPopup, this), $.proxy(this._onCloseSelectPopup, this), 'certSelect');
  },

  /**
   * @function
   * @desc 인증 선택 팝업 요청
   * @param isWelcome
   * @param before
   * @private
   */
  _openSelectPopup: function (isWelcome, before) {
    var methods = {
      skSms: {
        use: !this._smsBlock && (this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS) !== -1 ||
          this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE) !== -1),
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SK_SMS] === 'Y'
      },
      otherSms: {
        use: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS) !== -1,
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS] === 'Y'
      },
      save: {
        use: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SAVE) !== -1,
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SAVE] === 'Y'
      },
      publicCert: {
        use: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH) !== -1,
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH] === 'Y'
      },
      ipin: {
        use: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.IPIN) !== -1,
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.IPIN] === 'Y'
      },
      bio: {
        use: this._opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.BIO) !== -1 &&
          ((this._enableFido && !this._registerFido) || (this._enableFido && this._registerFido && this._useFido)),
        block: this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.BIO] === 'Y'
      }
    };

    var enableMethod = _.filter(methods, $.proxy(function (method) {
      return method.use;
    }, this));

    if ( Tw.FormatHelper.isEmpty(enableMethod) ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_BLOCK.TITLE, Tw.BUTTON_LABEL.CLOSE);
      return;
    }
    var checkBlock = _.filter(enableMethod, $.proxy(function (method) {
      return !method.block;
    }, this));

    if ( Tw.FormatHelper.isEmpty(checkBlock) ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE);
      return;
    } else if ( !Tw.FormatHelper.isEmpty(before) && checkBlock.length === 1 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE);
      return;
    }

    this._popupService.open({
      hbs: 'CO_CE_02_01',
      layer: true,
      data: {
        isWelcome: isWelcome,
        sLogin: this._svcInfo.loginType === Tw.AUTH_LOGIN_TYPE.EASY,
        masking: this._authKind === Tw.AUTH_CERTIFICATION_KIND.A,
        cntClass: this._methodCnt === 1 ? 'one' : this._methodCnt === 2 ? 'two' : 'three',
        methods: methods
      }
    }, $.proxy(this._onOpenSelectPopup, this), $.proxy(this._onCloseSelectPopup, this), 'certSelect');
  },

  /**
   * @function
   * @desc 인증 수단별 인증 요청
   * @param methods
   * @private
   */
  _openCertPopup: function (methods) {
    var isWelcome = false;
    if ( !Tw.FormatHelper.isEmpty(methods) ) {
      this._certMethod = methods;
      isWelcome = true;
    }

    switch ( this._certMethod ) {
      case Tw.AUTH_CERTIFICATION_METHOD.SK_SMS:
        this._certSk.open(
          this._svcInfo, this._authUrl, this._authKind, this._prodAuthKey, $.proxy(this._completeCert, this),
          this._opMethods, this._optMethods, isWelcome, this._methodCnt);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS:
        this._certNice = new Tw.CertificationNice();
        this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, this._niceKind, this._prodAuthKey, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.IPIN:
        this._certNice = new Tw.CertificationNice();
        this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.IPIN, this._niceKind, this._prodAuthKey, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.PASSWORD:
        this._certPassword = new Tw.CertificationPassword();
        this._certPassword.open(this._authUrl, this._authKind, this._prodAuthKey, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH:
        this._certPublic = new Tw.CertificationPublic();
        this._certPublic.open(this._authUrl, this._authKind, this._prodAuthKey, this._command, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.BIO:
        this._certBio = new Tw.CertificationBio();
        this._certBio.open(this._authUrl, this._authKind, this._prodAuthKey, this._svcInfo,
          $.proxy(this._completeCert, this), this._registerFido, this._fidoTarget);
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.FINANCE_AUTH:
        this._certFinance = new Tw.CertificationFinance();
        this._certFinance.open(this._svcInfo, this._authUrl, this._authKind, this._prodAuthKey, this._command, this._authBlock, $.proxy(this._completeCert, this));
        break;
      case Tw.AUTH_CERTIFICATION_METHOD.SMS_REFUND:
        (new Tw.CertificationSkSmsRefund()).openSmsPopup($.proxy(this._completeCert, this));
        break;
      default:
        this._popupService.openAlert('Not Supported');
        break;

    }
  },

  /**
   * @function
   * @desc 인증 선택 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenSelectPopup: function ($popupContainer) {
    Tw.CommonHelper.focusOnActionSheet($popupContainer);

    this._onSelectPopup = true;
    $popupContainer.on('click', '#fe-bt-sk', _.debounce($.proxy(this._onClickSkSms, this), 500));
    $popupContainer.on('click', '#fe-bt-kt', _.debounce($.proxy(this._onClickKtSms, this), 500));
    $popupContainer.on('click', '#fe-bt-lg', _.debounce($.proxy(this._onClickLgSms, this), 500));
    $popupContainer.on('click', '#fe-bt-save', _.debounce($.proxy(this._onClickSaveSms, this), 500));
    $popupContainer.on('click', '#fe-bt-ipin', _.debounce($.proxy(this._onClickIpin, this), 500));
    $popupContainer.on('click', '#fe-bt-bio', _.debounce($.proxy(this._onClickBio, this), 500));
    $popupContainer.on('click', '#fe-bt-public', _.debounce($.proxy(this._onClickSkPublic, this), 500));
  },

  /**
   * @function
   * @desc 미환급금 인증 선택 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _opOpenRefundSelectPopup: function ($popupContainer) {
    Tw.CommonHelper.focusOnActionSheet($popupContainer);

    $popupContainer.on('click', '#fe-bt-sk-refund', _.debounce($.proxy(this._onClickSkSmsRefund, this), 500));
    $popupContainer.on('click', '#fe-bt-kt-refund', _.debounce($.proxy(this._onClickKtSms, this), 500));
    $popupContainer.on('click', '#fe-bt-lg-refund', _.debounce($.proxy(this._onClickLgSms, this), 500));
    $popupContainer.on('click', '#fe-bt-save-refund', _.debounce($.proxy(this._onClickSaveSms, this), 500));
    $popupContainer.on('click', '#fe-bt-ipin-refund', _.debounce($.proxy(this._onClickIpin, this), 500));
  },

  /**
   * @function
   * @desc 인증 선택 팝업 클로즈 콜백
   * @private
   */
  _onCloseSelectPopup: function () {
    this._onSelectPopup = false;
    if ( this._openCert ) {
      this._openCert = false;
      this._openCertPopup();
    } else if ( this._result ) {
      this._callback(this._result, this._deferred, this._command);
    } else {
      this._callback({ code: Tw.API_CODE.CERT_CANCEL });
    }
  },

  /**
   * @function
   * @desc SK SMS 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickSkSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.SK_SMS;
    this._openCert = true;
    this._userSmsOpen = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc KT 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickKtSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS;
    this._niceKind = Tw.AUTH_CERTIFICATION_NICE.KT;
    // this._openCert = true;
    // this._popupService.close();
    this._openCertPopup();
  },

  /**
   * @function
   * @desc LG 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickLgSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS;
    this._niceKind = Tw.AUTH_CERTIFICATION_NICE.LG;
    // this._openCert = true;
    // this._popupService.close();
    this._openCertPopup();
  },

  /**
   * @function
   * @desc 알뜰폰 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickSaveSms: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.OTHER_SMS;
    this._niceKind = Tw.AUTH_CERTIFICATION_NICE.SAVE;
    // this._openCert = true;
    // this._popupService.close();
    this._openCertPopup();
  },

  /**
   * @function
   * @desc 아이핀 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickIpin: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.IPIN;
    // this._openCert = true;
    // this._popupService.close();
    this._openCertPopup();
  },

  /**
   * @function
   * @desc 생체 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickBio: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.BIO;
    this._openCert = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 공인인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickSkPublic: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.PUBLIC_AUTH;
    this._openCert = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 미환급금 SMS 인증 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickSkSmsRefund: function () {
    this._certMethod = Tw.AUTH_CERTIFICATION_METHOD.SMS_REFUND;
    this._openCert = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 인증 완료 처리
   * @param resp
   * @private
   */
  _completeCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( this._optionCert ) {
        this._optionCert = false;
        this._certPassword = new Tw.CertificationPassword();
        this._certPassword.open(this._authUrl, this._authKind, this._command, $.proxy(this._completeCert, this));
      } else {
        resp.authKind = this._authKind;
        if ( !Tw.FormatHelper.isEmpty(this._svcInfo) ) {
          resp.svcMgmtNum = this._svcInfo.svcMgmtNum;
        } else {
          resp.svcMgmtNum = '';
        }
        if ( !this._onSelectPopup ) {
          this._callback(resp, this._deferred, this._command);
        } else {
          this._result = resp;
          this._popupService.close();
        }
      }
    } else if ( resp.code === Tw.API_CODE.CERT_SELECT ) {
      if ( !Tw.FormatHelper.isEmpty(resp.target) && resp.target === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS ) {
        this._openSelectPopup(false, resp.target);
      } else {
        this._checkSmsEnable(resp.target);
      }
    } else if ( resp.code === Tw.API_CODE.CERT_SMS_BLOCK ) {
      this._smsBlock = true;
      this._openSelectPopup(true);
    } else {
      if ( !this._onSelectPopup ) {
        this._callback(resp, this._deferred, this._command);
      } else {
        this._result = resp;
        this._popupService.close();
      }
    }
  },

  /**
   * @function
   * @desc SK SMS 인증 가능여부 확인 요청
   * @param target
   * @private
   */
  _checkSmsEnable: function (target) {
    this._certSk.checkSmsEnable(this._svcInfo, this._opMethods, this._optMethods, this._methodCnt,
      $.proxy(this._completeCheckSmsEnable, this, target));
  },

  /**
   * @function
   * @desc SK SMS 인증 가능여부 응답 처리
   * @param target
   * @param resp
   * @private
   */
  _completeCheckSmsEnable: function (target, resp) {
    if ( resp.code === Tw.API_CODE.CERT_SMS_BLOCK ) {
      this._smsBlock = true;
    }
    this._openSelectPopup(false, target);
  }
};
