/**
 * @file certification.sk.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.08.20
 */

/**
 * @class
 * @desc 공통 > 인증 > SMS 인증 (S,R)
 * @constructor
 */
Tw.CertificationSk = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;

  this._svcInfo = null;
  this._authUrl = null;
  this._authKind = null;
  this._callback = null;
  this._prodAuthKey = null;

  this._callbackParam = null;
  this._smsType = '';
  this._enableKeyin = false;
  this._defaultKeyin = false;
  this._securityAuth = false;
  this._securityMdn = '';
  this._seqNo = '';
  this._onKeyin = false;
  this._jobCode = null;
  this._allSvcInfo = null;
  this._methodCnt = 0;

  this._addTimer = null;
  this._addTime = null;

  // window.onRefresh = $.proxy(this._onRefreshCallback, this);
};


Tw.CertificationSk.prototype = {
  /**
   * @member {object}
   * @desc SMS 인증 오류 코드
   * @readonly
   * @prop {string} ATH2001 시스템 사정으로 SMS서비스를 일시적으로 이용하실 수 없습니다. 불편을 드려 죄송합니다. 잠시 후 다시 확인해 주십시오.
   * @prop {string} ATH2003 재전송제한시간이 지난 후에 이용하세요.
   * @prop {string} ATH2006 제한시간 내에 보낼수있는 발송량이 초과하였습니다.
   * @prop {string} ATH2007 입력하신 인증번호가 맞지 않습니다. 다시 입력해 주세요.
   * @prop {string} ATH2008 인증번호를 입력할 수 있는 시간이 초과 하였습니다.
   * @prop {string} ATH2009 시스템 사정으로 SMS서비스를 일시적으로 이용하실 수 없습니다. 불편을 드려 죄송합니다. 잠시 후 다시 확인해 주십시오.
   * @prop {string} ATH1221 인증번호 유효시간이 경과되었습니다.
   * @prop {string} ATH2000 안드로이드 보안인증 실패
   * @prop {string} ATH2011 인증번호의 입력 오류 횟수가 초과 되었습니다.
   * @prop {string} ATH2013 이미 인증을 받은번호입니다.
   * @prop {string} ATH2014 잘못된 인증요청입니다.
   * @prop {string} ATH8007 일시정지 또는 분실 상태에서는 본인인증을 할 수 없습니다.
   * @prop {string} ICAS3101 인증번호를 전송할 수 없는 번호입니다.
   * @prop {string} ICAS3162 인증번호를 전송할 수 없는 번호입니다.
   *
   */
  SMS_ERROR: {
    ATH2001: 'ATH2001',
    ATH2003: 'ATH2003',     // 재전송 제한시간이 지난 후에 이용하시기 바랍니다.
    ATH2006: 'ATH2006',     // 제한시간 내에 보낼 수 있는 발송량이 초과하였습니다.
    ATH2007: 'ATH2007',     // 입력하신 인증번호가 맞지 않습니다.
    ATH2008: 'ATH2008',     // 인증번호를 입력할 수 있는 시간이 초과하였습니다.
    ATH2009: 'ATH2009',
    ATH1221: 'ATH1221',     // 인증번호 유효시간이 경과되었습니다.
    ATH2000: 'ATH2000',
    ATH2011: 'ATH2011',     //
    ATH2013: 'ATH2013',
    ATH2014: 'ATH2014',
    ATH8007: 'ATH8007',
    ICAS3101: 'ICAS3101',
    ICAS3162: 'ICAS3162'
  },

  /**
   * @function
   * @desc SMS 인증 가능 여부 요청
   * @param svcInfo
   * @param opMethods
   * @param optMethods
   * @param methodCnt
   * @param callback
   */
  checkSmsEnable: function (svcInfo, opMethods, optMethods, methodCnt, callback) {
    if ( Tw.FormatHelper.isEmpty(this._allSvcInfo) ) {
      this._getAllSvcInfo($.proxy(this._onSuccessAllSvcInfoCheck, this, svcInfo, opMethods, optMethods, methodCnt, callback));
    } else {
      if ( !this._checkEnableCase(this._allSvcInfo, svcInfo, opMethods, optMethods, methodCnt) ) {
        callback({ code: Tw.API_CODE.CERT_SMS_BLOCK });
      } else {
        callback({ code: Tw.API_CODE.CERT_SMS_ENABLE });
      }
    }
  },

  /**
   * @function
   * @desc 전체 회선 정보 요청
   * @param callback
   * @private
   */
  _getAllSvcInfo: function (callback) {
    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
      .done(callback)
      .fail($.proxy(this._failAllSvcInfo, this));
  },

  /**
   * @function
   * @desc 전체 회선 정보 요청 실패 처리
   * @param error
   * @private
   */
  _failAllSvcInfo: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 전체 회선 정보 요청 응답 처
   * @param svcInfo
   * @param opMethods
   * @param optMethods
   * @param methodCnt
   * @param callback
   * @param resp
   * @private
   */
  _onSuccessAllSvcInfoCheck: function (svcInfo, opMethods, optMethods, methodCnt, callback, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._allSvcInfo = resp.result;
      if ( !this._checkEnableCase(resp.result, svcInfo, opMethods, optMethods, methodCnt) ) {
        callback({ code: Tw.API_CODE.CERT_SMS_BLOCK });
      } else {
        callback({ code: Tw.API_CODE.CERT_SMS_ENABLE });
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc SMS 인증 가능 여부 확인
   * @param allSvc
   * @param svcInfo
   * @param opMethods
   * @param optMethods
   * @param methodCnt
   * @returns {boolean}
   * @private
   */
  _checkEnableCase: function (allSvc, svcInfo, opMethods, optMethods, methodCnt) {
    if ( Tw.FormatHelper.isEmpty(allSvc.m) ) {
      return false;
    }

    if ( svcInfo.smsUsableYn === 'N' || svcInfo.svcStCd === Tw.SVC_STATE.SP ) {
      if ( methodCnt === 1 ) {
        if ( !Tw.FormatHelper.isEmpty(optMethods) && optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SMS_KEYIN) !== -1 ) {
          this._defaultKeyin = true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  },

  /**
   * @fucntipn
   * @desc SMS 인증 요청
   * @param svcInfo
   * @param authUrl
   * @param authKind
   * @param prodAuthKey
   * @param callback
   * @param opMethods
   * @param optMethods
   * @param isWelcome
   * @param methodCnt
   */
  open: function (svcInfo, authUrl, authKind, prodAuthKey, callback, opMethods, optMethods, isWelcome, methodCnt) {
    this._callbackParam = null;
    this._svcInfo = svcInfo;
    this._authUrl = authUrl;
    this._authKind = authKind;
    this._callback = callback;
    this._prodAuthKey = prodAuthKey;
    this._methodCnt = methodCnt;

    if ( Tw.FormatHelper.isEmpty(this._allSvcInfo) ) {
      this._getAllSvcInfo($.proxy(this._onSuccessAllSvcInfo, this, opMethods, optMethods, isWelcome, methodCnt));
    } else {
      this._parseAllSvcInfo(this._allSvcInfo, opMethods, optMethods, isWelcome, methodCnt);
    }
  },

  /**
   * @function
   * @desc 전체 회선 조회 응답 처리
   * @param opMethods
   * @param optMethods
   * @param isWelcome
   * @param methodCnt
   * @param resp
   * @private
   */
  _onSuccessAllSvcInfo: function (opMethods, optMethods, isWelcome, methodCnt, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._allSvcInfo = resp.result;
      this._parseAllSvcInfo(resp.result, opMethods, optMethods, isWelcome, methodCnt);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc SMS 인증방식 확인
   * @param opMethods
   * @private
   */
  _checkSmsType: function (opMethods) {
    if ( opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE) !== -1 ) {
      this._smsType = Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE;
    } else {
      this._smsType = Tw.AUTH_CERTIFICATION_METHOD.SK_SMS;
    }
  },

  /**
   * @function
   * @desc SMS 인증 옵션 확인 (key-in, 보안인증)
   * @param optMethods
   * @private
   */
  _checkOption: function (optMethods) {
    if ( !Tw.FormatHelper.isEmpty(optMethods) && optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SMS_KEYIN) !== -1 ) {
      this._enableKeyin = true;
    }
    if ( !Tw.FormatHelper.isEmpty(optMethods) && optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SMS_SECURITY) !== -1 &&
      Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._securityAuth = true;
    }
  },

  /**
   * @function
   * @desc R인증인 경우 대표 회선 찾기
   * @param allSvc
   * @param opMethods
   * @param optMethods
   * @param isWelcome
   * @param methodCnt
   * @private
   */
  _parseAllSvcInfo: function (allSvc, opMethods, optMethods, isWelcome, methodCnt) {
    this._checkSmsType(opMethods);
    this._checkOption(optMethods);

    if ( this._smsType === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE ) {
      var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
      _.map(category, $.proxy(function (line) {
        var curLine = allSvc[Tw.LINE_NAME[line]];
        if ( !Tw.FormatHelper.isEmpty(curLine) ) {
          _.map(curLine, $.proxy(function (target) {
            if ( target.repSvcYn === 'Y' ) {
              this._svcInfo = target;
            }
          }, this));
        }
      }, this));
    }

    this._openSmsOnly(opMethods, optMethods, isWelcome, methodCnt);
  },

  /**
   * @function
   * @desc SMS 인증 팝업 오픈
   * @param opMethods
   * @param optMethods
   * @param isWelcome
   * @param methodCnt
   * @private
   */
  _openSmsOnly: function (opMethods, optMethods, isWelcome, methodCnt) {
    if ( !this._checkEnableCase(this._allSvcInfo, this._svcInfo, opMethods, optMethods, methodCnt) ) {
      this._callback({ code: Tw.API_CODE.CERT_SMS_BLOCK });
      return;
    }

    this._popupService.open({
      hbs: 'CO_CE_02_02_01_02',
      layer: true,
      data: {
        isWelcome: isWelcome,
        isOnly: methodCnt === 1,
        sLogin: this._svcInfo.loginType === Tw.AUTH_LOGIN_TYPE.EASY,
        masking: this._authKind === Tw.AUTH_CERTIFICATION_KIND.A,
        svcNum: Tw.FormatHelper.conTelFormatWithDash(this._svcInfo.svcNum),
        enableKeyin: this._enableKeyin
      }
    }, $.proxy(this._onOpenSmsOnly, this), $.proxy(this._onCloseSmsOnly, this), 'cert-sms');
  },

  /**
   * @function
   * @desc SMS 인증 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenSmsOnly: function ($popupContainer) {
    Tw.CommonHelper.focusOnActionSheet($popupContainer);

    this.$checkKeyin = $popupContainer.find('#fe-check-keyin');
    this.$inputMdn = $popupContainer.find('#fe-input-mdn');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btReCert = $popupContainer.find('#fe-bt-recert');
    this.$btCertAdd = $popupContainer.find('#fe-bt-cert-add');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$showTime = $popupContainer.find('#fe-sms-time');
    this.$errorCertTime = $popupContainer.find('#aria-sms-exp-desc1');
    this.$errorCertCnt = $popupContainer.find('#aria-sms-exp-desc2');
    this.$errorCertBlock = $popupContainer.find('#aria-sms-exp-desc10');
    this.$validCert = $popupContainer.find('#aria-sms-exp-desc3');
    this.$validAddCert = $popupContainer.find('#aria-sms-exp-desc4');
    this.$errorConfirm = $popupContainer.find('#aria-sms-exp-desc5');
    this.$errorConfirmTime = $popupContainer.find('#aria-sms-exp-desc6');
    this.$errorCertAddTime = $popupContainer.find('#aria-sms-exp-desc7');
    this.$errorConfirmCnt = $popupContainer.find('#aria-sms-exp-desc8');
    this.$errorCertStop = $popupContainer.find('#aria-sms-exp-desc9');

    this.$inputboxMdn = $popupContainer.find('#fe-inputbox-mdn');
    this.$inputboxCert = $popupContainer.find('#fe-inputbox-cert');

    $popupContainer.on('click', '#fe-other-cert', _.debounce($.proxy(this._onClickOtherCert, this), 500));
    $popupContainer.on('click', '.fe-bt-mdn-delete', $.proxy(this._onInputMdn, this));
    $popupContainer.on('click', '.fe-bt-cert-delete', $.proxy(this._onInputCert, this));

    this.$checkKeyin.on('change', $.proxy(this._onChangeKeyin, this));
    this.$inputMdn.on('input', $.proxy(this._onInputMdn, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));
    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btReCert.on('click', $.proxy(this._onClickReCert, this));
    this.$btCertAdd.on('click', $.proxy(this._onClickCertAdd, this));
    this.$btConfirm.on('click', _.debounce($.proxy(this._onClickConfirm, this), 500));

    if ( this._defaultKeyin ) {
      this.$checkKeyin.trigger('click');
      this.$checkKeyin.attr('disabled', true);
    } else {
      this._checkCertType();
    }

    new Tw.InputFocusService($popupContainer, this.$btConfirm);
    // if ( this._securityAuth ) {
    //   this.$btReCert.parent().addClass('none');
    // }
  },

  /**
   * @function
   * @desc SMS 인증 팝업 클로즈 콜백
   * @private
   */
  _onCloseSmsOnly: function () {
    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      clearInterval(this._addTimer);
    }

    if ( !Tw.FormatHelper.isEmpty(this._callbackParam) ) {
      this._callback(this._callbackParam);
    } else {
      this._callback({ code: Tw.API_CODE.CERT_CANCEL });
    }
  },

  /**
   * @function
   * @desc 휴대폰 번호 input event 처리
   * @param $event
   * @private
   */
  _onInputMdn: function ($event) {
    if ( !Tw.FormatHelper.isEmpty($event) ) {
      Tw.InputHelper.inputNumberOnly($event.target);
    }
    var mdnLength = this.$inputMdn.val().length;
    if ( mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN ) {
      this.$btCert.attr('disabled', false);
      this.$btReCert.attr('disabled', false);
    } else {
      this.$btCert.attr('disabled', true);
      this.$btReCert.attr('disabled', true);
    }
    this._checkEnableConfirmButton();
  },

  /**
   * @function
   * @desc SMS 인증번호 input event 처리
   * @param $event
   * @private
   */
  _onInputCert: function ($event) {
    if ( !Tw.FormatHelper.isEmpty($event) ) {
      Tw.InputHelper.inputNumberOnly($event.target);
    }
    var inputCert = this.$inputCert.val();
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
      this.$inputCert.val(inputCert.slice(0, Tw.DEFAULT_CERT_LEN));
    }
    this._checkEnableConfirmButton();

  },

  /**
   * @function
   * @desc 인증하기 하기 버튼 enable/disable 판단
   * @private
   */
  _checkEnableConfirmButton: function () {
    var inputCert = this.$inputCert.val();
    if ( this._onKeyin ) {
      var inputMdn = this.$inputMdn.val();
      var mdnLength = inputMdn ? inputMdn.length : 0;
      if ( inputCert.length >= Tw.DEFAULT_CERT_LEN && (mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN) ) {
        this.$btConfirm.attr('disabled', false);
      } else {
        this.$btConfirm.attr('disabled', true);
      }
    } else {
      if ( inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
        this.$btConfirm.attr('disabled', false);
      } else {
        this.$btConfirm.attr('disabled', true);
      }
    }
  },

  /**
   * @function
   * @desc 다른방식으로 인증하기 버튼 클릭 이벤트 처리
   * @param $event
   * @private
   */
  _onClickOtherCert: function ($event) {
    $event.stopPropagation();
    $event.preventDefault();

    this._callbackParam = {
      code: Tw.API_CODE.CERT_SELECT,
      target: Tw.AUTH_CERTIFICATION_METHOD.SK_SMS
    };
    this._popupService.close();
  },

  /**
   * @function
   * @desc key-in 인증 체크박스 클릭 이벤트 처리
   * @param event
   * @private
   */
  _onChangeKeyin: function (event) {
    var $target = $(event.target);

    this._clearCertError();
    this._clearConfirmError();

    this.$btCert.attr('disabled', true);
    this.$btCertAdd.attr('disabled', true);
    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      clearInterval(this._addTimer);
    }
    this.$showTime.val('');

    if ( $target.is(':checked') ) {
      this._onKeyin = true;
      this.$inputMdn.prop('readonly', false);
      this.$inputMdn.val('');
      this.$inputMdn.parents('#fe-inputbox-mdn').removeClass('readonly');
      this.$btReCert.addClass('none');
      this.$btCert.removeClass('none');
      this.$inputMdn.siblings('.cancel').removeClass('none');
    } else {
      this._onKeyin = false;
      this.$inputMdn.prop('readonly', true);
      this.$inputMdn.val(Tw.FormatHelper.conTelFormatWithDash(this._svcInfo.svcNum));
      this.$inputMdn.parents('#fe-inputbox-mdn').addClass('readonly');
      this.$btCert.addClass('none');
      this.$btReCert.removeClass('none');
      this.$inputMdn.siblings('.cancel').addClass('none');
    }
    this._checkEnableConfirmButton();
  },

  /**
   * @function
   * @desc 보안인증 여부 확인 및 처리
   * @private
   */
  _checkCertType: function () {
    if ( this._securityAuth ) {
      this._getMdn();
    } else {
      this._requestCert();
    }
  },

  /**
   * @function
   * @desc 안드로이드 MDN 요청
   * @private
   */
  _getMdn: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_MDN, {}, $.proxy(this._onMdn, this));
  },

  /**
   * @function
   * @desc 안드로이드 MDN 응답 처리
   * @param resp
   * @private
   */
  _onMdn: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._securityMdn = resp.params.mdn;
    } else {
      this._securityMdn = 'usim';
    }
    this._requestCert();
  },

  /**
   * @function
   * @desc 인증 방식에 따른 job code 설정
   * @private
   */
  _requestCert: function () {
    if ( this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ) {
      this._jobCode = Tw.BrowserHelper.isApp() ? 'NFM_MTW_PRDASTA_AUTH' : 'NFM_MWB_PRDASTA_AUTH';
      this._sendCert();
    } else if ( this._authKind === Tw.AUTH_CERTIFICATION_KIND.A ) {
      this._jobCode = Tw.BrowserHelper.isApp() ? 'NFM_MTW_CMNMASK_AUTH' : 'NFM_MWB_CMNMASK_AUTH';
      this._sendCert();
    } else {
      this._apiService.request(Tw.NODE_CMD.GET_URL_META, {})
        .done($.proxy(this._successGetUrlMeta, this))
        .fail($.proxy(this._failGetUrlMeta, this));
    }
  },

  /**
   * @function
   * @desc URL Meta 정보에서 job code 파싱
   * @param resp
   * @private
   */
  _successGetUrlMeta: function (resp) {
    this._jobCode = Tw.BrowserHelper.isApp() ? 'NFM_MTW_CMNBSNS_AUTH' : 'NFM_MWB_CMNBSNS_AUTH';
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.auth && resp.result.auth.jobCode ) {
        if ( Tw.FormatHelper.isEmpty(this._jobCode) ) {
          this._jobCode = Tw.BrowserHelper.isApp() ? resp.result.auth.jobCode.mobileApp : resp.result.auth.jobCode.mobileWeb;
        }
      }
    }
    this._sendCert();
  },

  /**
   * @function
   * @desc URL meta 정보 요청 실패 처리
   * @param error
   * @private
   */
  _failGetUrlMeta: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 자동문자완성 분기처리 (안드로이드)
   * @param reCert
   */
  _sendCert: function (reCert) {
    if ( Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.READY_SMS, {}, $.proxy(this._onReadySms, this, reCert));
    } else {
      this._sendCertApi(reCert);
    }
  },

  /**
   * @function
   * @desc 자동문자완성 준비완료 콜백
   * @param reCert
   * @param resp
   * @private
   */
  _onReadySms: function (reCert, resp) {
    this._sendCertApi(reCert);
  },

  /**
   * @function
   * @desc SMS 인증번호 요청
   * @param reCert
   * @private
   */
  _sendCertApi: function (reCert) {
    if ( this._smsType === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS ) {
      this._apiService.request(Tw.API_CMD.BFF_01_0014, {
        jobCode: this._jobCode,
        receiverNum: this._onKeyin ? this.$inputMdn.val() : '',
        mdn: this._securityMdn
      }).done($.proxy(this._successCert, this, reCert))
        .fail($.proxy(this._failCert, this));
    } else if ( this._smsType === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE ) {
      this._apiService.request(Tw.API_CMD.BFF_01_0057, {
        jobCode: this._jobCode,
        mdn: this._securityMdn
      }).done($.proxy(this._successCert, this, reCert))
        .fail($.proxy(this._failCert, this));

    }
  },

  /**
   * @function
   * @desc SMS 인증번호 요청 응답 처리
   * @param reCert
   * @param resp
   * @private
   */
  _successCert: function (reCert, resp) {
    this._clearCertError();
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._seqNo = resp.result.seqNo;
      this.$btCertAdd.attr('disabled', false);
      this._getCertNum();
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$validCert);
      if ( !reCert ) {
        this.$btCert.addClass('none');
        this.$btReCert.removeClass('none');
      }
      if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
        clearInterval(this._addTimer);
      }
      this._addTime = new Date();
      this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);
      if ( resp.result.corpPwdAuthYn === 'Y' ) {
        new Tw.CertificationBiz().open();
      }
    } else if ( resp.code === this.SMS_ERROR.ATH2003 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertTime);
    } else if ( resp.code === this.SMS_ERROR.ATH2006 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertCnt);
    } else if ( resp.code === this.SMS_ERROR.ATH2000 ) {
      if ( this._methodCnt === 1 ) {
        this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2000, null, null, $.proxy(this._onCloseMdnCertFail, this));
      } else {
        this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2000);
      }

    } else if ( resp.code === this.SMS_ERROR.ATH8007 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertStop);
    } else if ( resp.code === this.SMS_ERROR.ICAS3101 || resp.code === this.SMS_ERROR.ICAS3162 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertBlock);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
    Tw.CommonHelper.resetPopupHeight();
  },

  /**
   * @function
   * @desc SMS 인증번호 요청 실패 처라
   * @param error
   * @private
   */
  _failCert: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 안드로이드 자동문자완성 요청
   * @private
   */
  _getCertNum: function () {
    if ( Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.GET_CERT_NUMBER, {}, $.proxy(this._onCertNum, this));
    }
  },

  /**
   * @function
   * @desc 안드로이드 자동문자완성 응답 처리
   * @param resp
   * @private
   */
  _onCertNum: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this.$inputCert.val(resp.params.cert);
      this._onInputCert();
    }
  },

  /**
   * @function
   * @desc 보안인증 실패 처리
   * @private
   */
  _onCloseMdnCertFail: function () {
    // this._callbackParam = { code: Tw.API_CODE.CERT_SMS_BLOCK };
    this._popupService.close();
  },

  /**
   * @function
   * @desc SMS 인증번호 타이머 설정
   * @param startTime
   * @private
   */
  _showTimer: function (startTime) {
    var remainedSec = Tw.DateHelper.getRemainedSec(startTime);
    this.$showTime.val(Tw.DateHelper.convertMinSecFormat(remainedSec));
    if ( remainedSec <= 0 ) {
      clearInterval(this._addTimer);
    }
  },

  /**
   * @function
   * @desc 인증번호 전송 버튼 클릭 처리
   * @private
   */
  _onClickCert: function () {
    this._requestCert();
  },

  /**
   * @function
   * @desc 인증번호 재정송 버튼 클릭 처리
   * @private
   */
  _onClickReCert: function () {
    this._sendCert(true);
  },

  /**
   * @function
   * @desc 시간연장하기 버튼 클릭 처리
   */
  _onClickCertAdd: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this._seqNo })
      .done($.proxy(this._successCertAdd, this))
      .fail($.proxy(this._failCertAdd, this));
  },

  /**
   * @function
   * @desc 시간연장하기 응답 처리
   * @param $target
   * @param resp
   * @private
   */
  _successCertAdd: function (resp) {
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$validAddCert);
      if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
        clearInterval(this._addTimer);
      }
      this._addTime = new Date();
      this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);
    } else if ( resp.code === this.SMS_ERROR.ATH1221 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorCertAddTime);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 시간연장하기 실패 처리
   * @param error
   * @private
   */
  _failCertAdd: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 인증하기 클릭 이벤트 처리
   * @private
   */
  _onClickConfirm: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0015, {
      jobCode: this._jobCode,
      authNum: this.$inputCert.val(),
      authUrl: this._authUrl,
      receiverNum: this._onKeyin ? this.$inputMdn.val() : '',
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._prodAuthKey : '',
      authMethod: this._onKeyin ? Tw.AUTH_CERTIFICATION_METHOD.K : this._smsType
    }).done($.proxy(this._successConfirm, this))
      .fail($.proxy(this._failConfirm, this));
  },

  /**
   * @function
   * @desc SMS 인증하기 응답 처리
   * @param resp
   * @private
   */
  _successConfirm: function (resp) {
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._callbackParam = resp;
      this._popupService.close();
    } else if ( resp.code === this.SMS_ERROR.ATH2007 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorConfirm);
    } else if ( resp.code === this.SMS_ERROR.ATH2008 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorConfirmTime);
    } else if ( resp.code === this.SMS_ERROR.ATH2011 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCnt);
    } else if ( resp.code === this.SMS_ERROR.ATH2001 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2001);
    } else if ( resp.code === this.SMS_ERROR.ATH2009 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2009);
    } else if ( resp.code === this.SMS_ERROR.ATH2013 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2013);
    } else if ( resp.code === this.SMS_ERROR.ATH2014 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2014);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc SMS 인증하기 실패 처리
   * @param error
   * @private
   */
  _failConfirm: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc inputbox 에러 메시지 표기
   * @param inputBox
   * @param input
   * @param error
   * @private
   */
  _showError: function (inputBox, input, error) {
    inputBox.addClass('error');
    input.attr('aria-describedby', error.attr('id'));
    error.removeClass('none');
    error.attr('aria-hidden', false);
  },

  /**
   * @function
   * @desc inputbox 에러 메시지 삭제
   * @param inputBox
   * @param input
   * @param error
   * @private
   */
  _clearError: function (inputBox, input, error) {
    inputBox.removeClass('error');
    input.attr('aria-describedby', '');
    error.addClass('none');
    error.attr('aria-hidden', true);
  },

  /**
   * @function
   * @desc 인증번호 요청 에러 삭제
   * @private
   */
  _clearCertError: function () {
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$validCert);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertTime);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertCnt);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertStop);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertBlock);
  },

  /**
   * @function
   * @desc 인증번호 확인 에러 삭제
   * @private
   */
  _clearConfirmError: function () {
    this._clearError(this.$inputboxCert, this.$inputCert, this.$validAddCert);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorCertAddTime);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorConfirm);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorConfirmTime);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCnt);
  }
};