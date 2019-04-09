/**
 * @file common.member.slogin.ios.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.26
 */

/**
 * @class
 * @desc 공통 > 로그인/로그아웃 > IOS 간편로그인
 * @param rootEl
 * @param target
 * @constructor
 */
Tw.CommonMemberSloginIos = function (rootEl, target) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._target = target;
  this.mdn = '';
  this.certSeq = '';
  this._authBlock = '';

  this.$inputName = null;
  this.$inputBirth = null;
  this.$inputGender = null;
  this.$inputMdn = null;
  this.$inputCert = null;
  this.$btCert = null;
  this.$btCertAdd = null;
  this.$btLogin = null;

  this.$inputboxName = null;
  this.$inputboxBirth = null;
  this.$inputboxGender = null;
  this.$errorName = null;
  this.$errorNameMismatch = null;
  this.$errorBirth = null;
  this.$errorBirthLen = null;
  this.$errorGender = null;

  this.$validSendCert = null;
  this.$validAddCert = null;
  this.$errorCertTime = null;
  this.$errorCertCount = null;
  this.$errorLoginCert = null;
  this.$errorLoginTime = null;

  this._addTimer = null;
  this._addTime = null;
  // window.onRefresh = $.proxy(this._onRefreshCallback, this);

  this._bindEvent();
  this._getMethodBlock();
};

Tw.CommonMemberSloginIos.prototype = {
  /**
   * @member {object}
   * @desc 성별 코드
   * @readonly
   * @prop {string} 1
   * @prop {string} 2
   */
  GENDER_CODE: {
    '1': 'MALE',
    '2': 'FEMALE'
  },
  /**
   * @member {object}
   * @desc SMS 인증 오류 코드
   * @readonly
   * @prop {string} ATH1004 입력하신 정보가 일치하지 않습니다. 확인 후 재입력해 주세요.
   * @prop {string} ATH1005 휴대폰번호 입력오류
   * @prop {string} ATH2001 시스템 사정으로 SMS서비스를 일시적으로 이용하실 수 없습니다. 불편을 드려 죄송합니다. 잠시 후 다시 확인해 주십시오.
   * @prop {string} ATH2003 재전송제한시간이 지난 후에 이용하세요.
   * @prop {string} ATH2006 제한시간 내에 보낼수있는 발송량이 초과하였습니다.
   * @prop {string} ATH2007 입력하신 인증번호가 맞지 않습니다. 다시 입력해 주세요.
   * @prop {string} ATH2008 인증번호를 입력할 수 있는 시간이 초과 하였습니다.
   * @prop {string} ATH2009 시스템 사정으로 SMS서비스를 일시적으로 이용하실 수 없습니다. 불편을 드려 죄송합니다. 잠시 후 다시 확인해 주십시오.
   * @prop {string} ATH1221 인증번호 유효시간이 경과되었습니다.
   * @prop {string} ATH2011 인증번호의 입력 오류 횟수가 초과 되었습니다.
   * @prop {string} ATH2013 이미 인증을 받은번호입니다.
   * @prop {string} ATH2014 잘못된 인증요청입니다.
   * @prop {string} ICAS3101 인증번호를 전송할 수 없는 번호입니다.
   * @prop {string} ICAS3162 인증번호를 전송할 수 없는 번호입니다.
   *
   */
  SMS_ERROR: {
    ATH1004: 'ATH1004',     // 입력하신 정보가 일치하지 않습니다. 확인 후 재입력해 주세요.
    ATH1005: 'ATH1005',     // 휴대폰번호 입력오류
    ATH2003: 'ATH2003',     // 재전송 제한시간이 지난 후에 이용하시기 바랍니다.
    ATH2001: 'ATH2001',
    ATH2006: 'ATH2006',     // 제한시간 내에 보낼 수 있는 발송량이 초과하였습니다.
    ATH2007: 'ATH2007',     // 입력하신 인증번호가 맞지 않습니다.
    ATH2008: 'ATH2008',     // 인증번호를 입력할 수 있는 시간이 초과하였습니다.
    ATH2009: 'ATH2009',
    ATH1221: 'ATH1221',     // 인증번호 유효시간이 경과되었습니다.
    ATH2011: 'ATH2011',
    ATH2013: 'ATH2013',
    ATH2014: 'ATH2014',
    ICAS3101: 'ICAS3101',
    ICAS3162: 'ICAS3162'
  },

  /**
   * @function
   * @desc SMS 인증 점검 여부 확인
   * @private
   */
  _getMethodBlock: function () {
    this._apiService.request(Tw.NODE_CMD.GET_AUTH_METHOD_BLOCK, {})
      .done($.proxy(this._successGetAuthMethodBlock, this));
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
    if ( this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SK_SMS] === 'Y' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE,
        null, $.proxy(this._onCloseBlockPopup, this));
    }
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
   * @desc SMS 인증 점검 팝업 확인 callback
   * @private
   */
  _onCloseBlockPopup: function () {
    this._historyService.goBack();
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    // this.$container.on('click', '#fe-bt-cop', $.proxy(this._onClickCopBtn, this));

    this.$inputName = this.$container.find('#fe-input-name');
    this.$inputBirth = this.$container.find('#fe-input-birth');
    this.$inputGender = this.$container.find('.fe-radio-gender');
    this.$inputMdn = this.$container.find('#fe-input-mdn');
    this.$inputCert = this.$container.find('#fe-input-cert');
    this.$btCert = this.$container.find('#fe-bt-cert');
    this.$btReCert = this.$container.find('#fe-bt-recert');
    this.$btCertAdd = this.$container.find('#fe-bt-cert-add');
    this.$btLogin = this.$container.find('#fe-bt-login');
    this.$showTime = this.$container.find('#fe-sms-time');

    this.$inputboxName = this.$container.find('#fe-inputbox-name');
    this.$inputboxBirth = this.$container.find('#fe-inputbox-birth');
    this.$inputboxGender = this.$container.find('#fe-inputbox-gender');
    this.$errorName = this.$container.find('#aria-phone-tx1');
    this.$errorNameMismatch = this.$container.find('#aria-phone-tx2');
    this.$errorBirth = this.$container.find('#aria-birth-tx1');
    this.$errorBirthLen = this.$container.find('#aria-birth-tx2');
    this.$errorGender = this.$container.find('#aria-gender-tx');

    this.$inputboxMdn = this.$container.find('#fe-inputbox-mdn');
    this.$inputboxCert = this.$container.find('#fe-inputbox-cert');

    this.$validSendCert = this.$container.find('#aria-cert-num2');
    this.$validAddCert = this.$container.find('#aria-cert-num1');
    this.$errorCertTime = this.$container.find('#aria-cert-num3');
    this.$errorCertCount = this.$container.find('#aria-cert-num4');
    this.$errorCertAddTime = this.$container.find('#aria-cert-num5');
    this.$errorCertBlock = this.$container.find('#aria-cert-num6');
    this.$errorLoginCert = this.$container.find('#aria-phone-err1');
    this.$errorLoginTime = this.$container.find('#aria-phone-err2');
    this.$errorLoginCnt = this.$container.find('#aria-phone-err3');

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btReCert.on('click', $.proxy(this._onClickReCert, this));
    this.$btCertAdd.on('click', $.proxy(this._onClickCertAdd, this));
    this.$btLogin.click(_.debounce($.proxy(this._onClickLogin, this), 500));

    this.$inputMdn.on('input', $.proxy(this._onInputMdn, this));
    this.$inputGender.on('click', $.proxy(this._onClickGender, this));
    this.$inputBirth.on('input', $.proxy(this._onInputBirth, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

    this.$container.on('click', '.fe-bt-cert-delete', $.proxy(this._onInputCert, this));
    this.$container.on('click', '.fe-bt-mdn-delete', $.proxy(this._onInputMdn, this));

    new Tw.InputFocusService(this.$container, this.$btLogin);
  },

  /**
   * @function
   * @desc 휴대폰 번호 input event 처리
   * @param $event
   * @private
   */
  _onInputMdn: function ($event) {
    Tw.InputHelper.inputNumberOnly($event.target);
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
   * @desc 생년월일 input event 처리
   * @param $event
   * @private
   */
  _onInputBirth: function ($event) {
    Tw.InputHelper.inputNumberOnly($event.target);
    var inputBirth = this.$inputBirth.val();
    if ( inputBirth.length >= Tw.BIRTH_LEN ) {
      this.$inputBirth.val(inputBirth.slice(0, Tw.BIRTH_LEN));
    }
  },

  /**
   * @function
   * @desc SMS 인증번호 input event 처리
   * @param $event
   * @private
   */
  _onInputCert: function ($event) {
    Tw.InputHelper.inputNumberOnly($event.target);
    var inputCert = this.$inputCert.val();
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
      this.$inputCert.val(inputCert.slice(0, Tw.DEFAULT_CERT_LEN));
    }
    this._checkEnableConfirmButton();
  },

  /**
   * @function
   * @desc 로그인 하기 버튼 enable/disable 판단
   * @private
   */
  _checkEnableConfirmButton: function () {
    var inputCert = this.$inputCert.val();
    var inputMdn = this.$inputMdn.val();
    var mdnLength = inputMdn ? inputMdn.length : 0;
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN && (mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN) ) {
      this.$btLogin.attr('disabled', false);
    } else {
      this.$btLogin.attr('disabled', true);
    }
  },

  /**
   * @function
   * @desc 성별 클릭 event 처리
   * @param $event
   * @private
   */
  _onClickGender: function ($event) {
    var $currentTarget = $($event.currentTarget);
    this.$inputGender.prop('checked', false);
    this.$inputGender.parent().removeClass('checked');
    this.$inputGender.attr('aria-checked', false);
    $currentTarget.prop('checked', true);
    $currentTarget.parent().addClass('checked');
    $currentTarget.attr('aria-checked', true);
  },

  /**
   * @function
   * @desc 인증번호 전송 버튼 클릭 처리
   * @param $event
   * @private
   */
  _onClickCert: function ($event) {
    var $target = $($event.currentTarget);
    this._sendCert(false, $target);
  },

  /**
   * @function
   * @desc 인증번호 재정송 버튼 클릭 처리
   * @param $event
   * @private
   */
  _onClickReCert: function ($event) {
    var $target = $($event.currentTarget);
    this._sendCert(true, $target);
  },

  /**
   * @function
   * @desc SMS 인증번호 요청
   * @param reCert
   * @param $target
   */
  _sendCert: function (reCert, $target) {
    if ( this._checkCertValidation() ) {
      this.mdn = this.$inputMdn.val();
      var params = {
        mbrNm: this.$inputName.val(),
        birthDt: this.$inputBirth.val(),
        gender: this.GENDER_CODE[this.$inputGender.filter(':checked').val()]
      };
      this._apiService.request(Tw.API_CMD.BFF_03_0019, params, {}, [this.mdn])
        .done($.proxy(this._successRequestCert, this, reCert, $target))
        .fail($.proxy(this._failRequestCert, this));
    }
  },

  /**
   * @function
   * @desc 시간연장하기 버튼 클릭 처리
   * @param $event
   */
  _onClickCertAdd: function ($event) {
    var $target = $($event.currentTarget);
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this.certSeq })
      .done($.proxy(this._successRequestCertAdd, this, $target))
      .fail($.proxy(this._failRequestCertAdd, this));
  },

  /**
   * @function
   * @desc SMS 인증번호 요청 응답 처리
   * @param reCert
   * @param $target
   * @param resp
   * @private
   */
  _successRequestCert: function (reCert, $target, resp) {
    this._clearCertError();
    this._clearLoginError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$btCertAdd.attr('disabled', false);
      this.certSeq = resp.result.seqNo;
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$validSendCert);
      if ( !reCert ) {
        this.$btCert.addClass('none');
        this.$btReCert.removeClass('none');
      }
      if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
        clearInterval(this._addTimer);
      }
      this._addTime = new Date();
      this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);
    } else {
      this._checkCertError(resp.code, resp.msg, $target);
    }
  },

  /**
   * @function
   * @desc SMS 인증번호 요청 실패 처
   * @param error
   * @private
   */
  _failRequestCert: function (error) {
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
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
  // _expireAddTime: function () {
  //   this.$btReCert.removeClass('none');
  //   this.$btCertAdd.addClass('none');
  // },

  /**
   * @function
   * @desc SMS 인증번호 요청 에러 처리
   * @param errorCode
   * @param errorMsg
   * @param $target
   * @private
   */
  _checkCertError: function (errorCode, errorMsg, $target) {
    // this._clearCertError();
    if ( errorCode === this.SMS_ERROR.ATH2003 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertTime);
    } else if ( errorCode === this.SMS_ERROR.ATH2006 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertCount);
    } else if ( errorCode === this.SMS_ERROR.ICAS3101 || errorCode === this.SMS_ERROR.ICAS3162 ) {
      this._showError(this.$inputboxMdn, this.$inputMdn, this.$errorCertBlock);
    } else if ( errorCode === this.SMS_ERROR.ATH1004 || errorCode === this.SMS_ERROR.ATH1005 ) {
      this._showError(this.$inputboxName, this.$inputName, this.$errorNameMismatch, 'aria-phone-tx2');
    } else {
      Tw.Error(errorCode, errorMsg).pop(null, $target);
    }
  },

  /**
   * @function
   * @desc 시간연장하기 응답 처리
   * @param $target
   * @param resp
   * @private
   */
  _successRequestCertAdd: function ($target, resp) {
    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      clearTimeout(this._addTimer);
    }
    this._clearCertError();
    this._clearLoginError();
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
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },

  /**
   * @function
   * @desc 시간연장하기 실패 처리
   * @param error
   * @private
   */
  _failRequestCertAdd: function (error) {
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 로그인하기 클릭 이벤트 처
   * @param $event
   * @private
   */
  _onClickLogin: function ($event) {
    var $target = $($event.currentTarget);
    var inputCert = this.$inputCert.val();
    if ( this._checkLoginValidation(inputCert, $target) ) {
      var params = {
        svcNum: this.$inputMdn.val(),
        mbrNm: this.$inputName.val(),
        birthDt: this.$inputBirth.val(),
        gender: this.GENDER_CODE[this.$inputGender.filter(':checked').val()],
        authNum: inputCert
      };
      this._requestLogin(params, $target);
    }
  },

  /**
   * @function
   * @desc IOS 간편로그인 API 요청
   * @param params
   * @param $target
   */
  _requestLogin: function (params, $target) {
    this._apiService.request(Tw.NODE_CMD.EASY_LOGIN_IOS, params)
      .done($.proxy(this._successRequestLogin, this, $target))
      .fail($.proxy(this._failRequestLogin, this));
  },

  /**
   * @function
   * @desc 로그인 응답 처리
   * @param $target
   * @param resp
   * @private
   */
  _successRequestLogin: function ($target, resp) {
    this._clearLoginError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( Tw.FormatHelper.isEmpty(this._target) || this._target === 'undefined' ) {
        this._historyService.goBack();
      } else {
        this._historyService.replaceURL(this._target);
      }
    } else if ( resp.code === this.SMS_ERROR.ATH2007 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorLoginCert);
    } else if ( resp.code === this.SMS_ERROR.ATH2008 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorLoginTime);
    } else if ( resp.code === this.SMS_ERROR.ATH2011 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorLoginCnt);
    } else if ( resp.code === this.SMS_ERROR.ATH2001 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2001, null, null, null, null, $target);
    } else if ( resp.code === this.SMS_ERROR.ATH2009 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2009, null, null, null, null, $target);
    } else if ( resp.code === this.SMS_ERROR.ATH2013 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2013, null, null, null, null, $target);
    } else if ( resp.code === this.SMS_ERROR.ATH2014 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2014, null, null, null, null, $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },

  /**
   * @function
   * @desc 로그인 실패 처리
   * @param error
   * @private
   */
  _failRequestLogin: function (error) {
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc input validation 체크
   * @returns {boolean}
   * @private
   */
  _checkCertValidation: function () {
    var inputName = this.$inputName.val();
    var inputBirth = this.$inputBirth.val();
    var result = true;
    this._clearAllError();
    if ( Tw.FormatHelper.isEmpty(inputName) ) {
      result = false;
      this._showError(this.$inputboxName, this.$inputName, this.$errorName);
    }
    if ( Tw.FormatHelper.isEmpty(inputBirth) ) {
      result = false;
      this._showError(this.$inputboxBirth, this.$inputBirth, this.$errorBirth);
    } else if ( inputBirth.length !== Tw.BIRTH_LEN ) {
      result = false;
      this._showError(this.$inputboxBirth, this.$inputBirth, this.$errorBirthLen);
    }
    if ( this.$inputGender.filter(':checked').length === 0 ) {
      result = false;
      this._showError(this.$inputboxGender, this.$inputGender, this.$errorGender);
    }
    return result;
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
  // _onRefreshCallback: function () {
  //   if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
  //     var interval = new Date().getTime() - this._addTime;
  //
  //     clearTimeout(this._addTimer);
  //     if ( interval > Tw.SMS_CERT_TIME ) {
  //       this._expireAddTime();
  //     } else {
  //       this._addTimer = setTimeout($.proxy(this._expireAddTime, this), Tw.SMS_CERT_TIME - interval);
  //     }
  //   }
  // },

  /**
   * @function
   * @desc input 에러 삭제
   * @private
   */
  _clearAllError: function () {
    this._clearError(this.$inputboxName, this.$inputName, this.$errorName);
    this._clearError(this.$inputboxName, this.$inputName, this.$errorNameMismatch);
    this._clearError(this.$inputboxBirth, this.$inputBirth, this.$errorBirth);
    this._clearError(this.$inputboxBirth, this.$inputBirth, this.$errorBirthLen);
    this._clearError(this.$inputboxGender, this.$inputGender, this.$errorGender);
  },

  /**
   * @function
   * @desc 인증번호 요청 에러 삭제
   * @private
   */
  _clearCertError: function () {
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$validSendCert);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertTime);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertCount);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertBlock);
  },

  /**
   * @function
   * @desc 인증번호 확인 에러 삭제
   * @private
   */
  _clearLoginError: function () {
    this._clearError(this.$inputboxCert, this.$inputCert, this.$validAddCert);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorCertAddTime);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorLoginCert);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorLoginTime);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorLoginCnt);
  },

  /**
   * @function
   * @desc 로그인 validation 체크
   * @param inputCert
   * @param $target
   * @returns {boolean}
   * @private
   */
  _checkLoginValidation: function (inputCert, $target) {
    if ( Tw.FormatHelper.isEmpty(inputCert) ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.EMPTY_CERT, null, null, null, null, $target);
      return false;
    }
    return true;
  }
  // _onClickCopBtn: function () {
  //   this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
  //     type: Tw.NTV_BROWSER.EXTERNAL,
  //     href: Tw.URL_PATH.COP_SERVICE
  //   });
  // }
};