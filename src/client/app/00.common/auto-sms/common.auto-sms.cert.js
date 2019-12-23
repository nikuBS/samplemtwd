/**
 * @file common.auto-sms.cert.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.03.14
 */

/**
 * @class
 * @desc Common > 스윙자동문자발송 > SMS인증
 * @param rootEl - dom 객체
 * @param encParam
 * @constructor
 */
Tw.CommonAutoSmsCert = function (rootEl, encParam) {
  this.$container = rootEl;
  this._encParamStr = encParam;
  this._historyService = new Tw.HistoryService();

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._addTimer = null;
  this._addTime = null;

  this._bindEvent();
};

Tw.CommonAutoSmsCert.prototype = {
  /**
   * @member {object}
   * @desc SMS 인증 오류 코드
   * @readonly
   * @prop {string} ATH2003 재전송 제한시간이 지난 후에 이용하시기 바랍니다.
   * @prop {string} ATH2006 제한시간 내에 보낼 수 있는 발송량이 초과하였습니다.
   * @prop {string} ATH2007 입력하신 인증번호가 맞지 않습니다.
   * @prop {string} ATH2008 인증번호를 입력할 수 있는 시간이 초과하였습니다.
   * @prop {string} ZNGME0098 입력하신 정보가 확인되지 않습니다.
   * @prop {string} ZORDE6044 법인 등록번호를 다시 확인해 주세요.
   */
  SMS_ERROR: {
    ATH2003: 'ATH2003',
    ATH2006: 'ATH2006',
    ATH2007: 'ATH2007',
    ATH2008: 'ATH2008',
    ZNGME0098: 'ZNGME0098',
    ZORDE6044: 'ZORDE6044'
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$inputType = this.$container.find('.fe-radio-type');
    this.$inputBirthY = this.$container.find('#fe-input-birth-y');
    this.$inputBirthM = this.$container.find('#fe-input-birth-m');
    this.$inputBirthD = this.$container.find('#fe-input-birth-d');
    this.$inputBiz = this.$container.find('#fe-input-biz');
    this.$inputMdn = this.$container.find('#fe-input-mdn');
    this.$inputCert = this.$container.find('#fe-input-cert');
    this.$btCert = this.$container.find('#fe-bt-cert');
    this.$btReCert = this.$container.find('#fe-bt-recert');
    this.$btCertAdd = this.$container.find('#fe-bt-cert-add');
    this.$btConfirm = this.$container.find('#fe-bt-confirm');
    this.$showTime = this.$container.find('#fe-sms-time');

    this.$errorBirth = this.$container.find('#fe-birth-error');
    this.$errorBiz = this.$container.find('#fe-biz-error');

    this.$validCert = this.$container.find('#fe-txt-cert');
    this.$validRecert = this.$container.find('#fe-txt-recert');
    this.$validAddCert = this.$container.find('#fe-txt-cert-add');
    this.$errorCertTime = this.$container.find('#fe-error-cert-time');
    this.$errorCertCount = this.$container.find('#fe-error-cert-cnt');
    this.$errorCertAddTime = this.$container.find('#fe-error-add-time');

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btReCert.on('click', $.proxy(this._onClickReCert, this));
    this.$btCertAdd.on('click', $.proxy(this._onClickCertAdd, this));
    this.$btConfirm.on('click', _.debounce($.proxy(this._onClickConfirm, this), 500));
    this.$inputType.on('click', $.proxy(this._onClickType, this));
    this.$inputMdn.on('input', $.proxy(this._onInputMdn, this));
    this.$inputBirthY.on('input', $.proxy(this._onInputBirthY, this));
    this.$inputBirthM.on('input', $.proxy(this._onInputBirthM, this));
    this.$inputBirthD.on('input', $.proxy(this._onInputBirthD, this));
    this.$inputBiz.on('input', $.proxy(this._onInputBiz, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));

    this.$txtCustomer = this.$container.find('#fe-txt-customer');
    this.$txtBiz = this.$container.find('#fe-txt-biz');
    this.$contCustomer = this.$container.find('#fe-cont-customer');
    this.$contBiz = this.$container.find('#fe-cont-biz');

    this.$container.on('click', '.fe-bt-mdn-delete', $.proxy(this._onInputMdn, this));
    this.$container.on('click', '.fe-bt-cert-delete', $.proxy(this._onInputCert, this));
    this.$container.on('click', '.fe-bt-biz-delete', $.proxy(this._onInputBiz, this));

    new Tw.InputFocusService(this.$container, this.$btConfirm);
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
      this.$btCert.parent().removeClass('disabled');
    } else {
      this.$btCert.attr('disabled', true);
      this.$btReCert.attr('disabled', true);
      this.$btCert.parent().addClass('disabled');
    }
    this._checkEnableConfirmButton();
  },

  /**
   * @function
   * @desc 생년월일 - 연도 input event 처리
   * @param $event
   * @private
   */
  _onInputBirthY: function ($event) {
    Tw.InputHelper.inputNumberOnly($event.target);
    var inputBirth = this.$inputBirthY.val();
    if ( inputBirth.length >= Tw.BIRTH_Y_LEN ) {
      this.$inputBirthY.val(inputBirth.slice(0, Tw.BIRTH_Y_LEN));
    }
  },

  /**
   * @function
   * @desc 생년월일 - 월 input event 처리
   * @param $event
   * @private
   */
  _onInputBirthM: function ($event) {
    Tw.InputHelper.inputNumberOnly($event.target);
    var inputBirth = this.$inputBirthM.val();
    if ( inputBirth.length >= Tw.BIRTH_MD_LEN ) {
      this.$inputBirthM.val(inputBirth.slice(0, Tw.BIRTH_MD_LEN));
    }
  },

  /**
   * @function
   * @desc 생년월일 - 일 input event 처리
   * @param $event
   * @private
   */
  _onInputBirthD: function ($event) {
    Tw.InputHelper.inputNumberOnly($event.target);
    var inputBirth = this.$inputBirthD.val();
    if ( inputBirth.length >= Tw.BIRTH_MD_LEN ) {
      this.$inputBirthD.val(inputBirth.slice(0, Tw.BIRTH_MD_LEN));
    }
  },

  /**
   * @function
   * @desc 법인번호 input event 처리
   * @param $event
   * @private
   */
  _onInputBiz: function ($event) {
    Tw.InputHelper.inputNumberOnly($event.target);
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
   * @desc 일반 / 법인 click event 처리
   * @param $event
   * @private
   */
  _onClickType: function ($event) {
    var $currentTarget = $($event.currentTarget);
    this.$inputType.prop('checked', false);
    this.$inputType.parent().removeClass('checked');
    $currentTarget.prop('checked', true);
    $currentTarget.parent().addClass('checked');

    var type = $currentTarget.val();
    if ( type === '1' ) {
      this.$txtBiz.addClass('none');
      this.$contBiz.addClass('none');
      this.$txtCustomer.removeClass('none');
      this.$contCustomer.removeClass('none');
    } else {
      this.$txtCustomer.addClass('none');
      this.$contCustomer.addClass('none');
      this.$txtBiz.removeClass('none');
      this.$contBiz.removeClass('none');
    }

  },

  /**
   * @function
   * @desc 확인 버튼 enable/disable 판단
   * @private
   */
  _checkEnableConfirmButton: function () {
    var inputCert = this.$inputCert.val();
    var inputMdn = this.$inputMdn.val();
    var mdnLength = inputMdn ? inputMdn.length : 0;
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN && (mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN) ) {
      this.$btConfirm.attr('disabled', false);
    } else {
      this.$btConfirm.attr('disabled', true);
    }
  },

  /**
   * @function
   * @desc 인증번호 전송 버튼 클릭 처리
   * @private
   */
  _onClickCert: function () {
    this._sendCert(false);
  },

  /**
   * @function
   * @desc 인증번호 재전송 버튼 클릭 처리
   * @private
   */
  _onClickReCert: function () {
    this._sendCert(true);
  },

  /**
   * @function
   * @desc SMS 인증번호 요청
   * @param reCert
   * @private
   */
  _sendCert: function (reCert) {
    var type = this.$inputType.filter(':checked').val();
    // type = '1';
    if ( this._checkCertValidation(type) ) {
      this.mdn = this.$inputMdn.val();

      var params = {
        encParamStr: this._encParamStr,
        svcNum: this.mdn
      };

      this._getParameter(params, type);

      this._apiService.request(Tw.API_CMD.BFF_08_0075, params)
        .done($.proxy(this._successRequestCert, this, reCert))
        .fail($.proxy(this._failRequestCert, this));
    }
  },

  /**
   * @function
   * @desc 시간연장하기 버튼 클릭 처리
   * @private
   */
  _onClickCertAdd: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this.certSeq })
      .done($.proxy(this._successRequestCertAdd, this))
      .fail($.proxy(this._failRequestCertAdd, this));
  },

  /**
   * @function
   * @desc 일반 / 법인 parameter 추가
   * @param params
   * @param type
   * @private
   */
  _getParameter: function (params, type) {
    if ( type === '1' ) {
      $.extend(params, {
        birthYY: this.$inputBirthY.val(),
        birthMM: this.$inputBirthM.val(),
        birthDD: this.$inputBirthD.val()
      });
    } else {
      $.extend(params, {
        companyNum: this.$inputBiz.val()
      });
    }
  },

  /**
   * @function
   * @desc input field validation 체크
   * @param type
   * @returns {boolean}
   * @private
   */
  _checkCertValidation: function (type) {
    this._clearAllError();
    if ( type === '1' ) {
      var inputBirthY = this.$inputBirthY.val();
      var inputBirthM = this.$inputBirthM.val();
      var inputBirthD = this.$inputBirthD.val();
      if ( Tw.FormatHelper.isEmpty(inputBirthY) || Tw.FormatHelper.isEmpty(inputBirthM) || Tw.FormatHelper.isEmpty(inputBirthD) ) {
        this._showError(null, null, this.$errorBirth);
        return false;
      }
      return true;
    } else {
      var inputBiz = this.$inputBiz.val();
      if ( Tw.FormatHelper.isEmpty(inputBiz) ) {
        this._showError(null, null, this.$errorBiz);
        return false;
      }
      return true;
    }
  },

  /**
   * @function
   * @desc SMS 인증번호 요청 응답 처리
   * @param reCert
   * @param resp
   * @private
   */
  _successRequestCert: function (reCert, resp) {
    this._clearCertError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$btCertAdd.attr('disabled', false);
      this.$btCertAdd.parent().removeClass('disabled');
      this.certSeq = resp.result.seqNo;
      if ( !reCert ) {
        this.$btCert.addClass('none');
        this.$btReCert.removeClass('none');
        this._showError(null, null, this.$validCert);
      } else {
        this._showError(null, null, this.$validRecert);
      }
      if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
        clearInterval(this._addTimer);
      }
      this._addTime = new Date();
      this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);
    } else {
      this._checkCertError(resp.code, resp.msg);
    }
  },

  /**
   * @function
   * @desc SMS 인증번호 요청 실패 처리
   * @param error
   * @private
   */
  _failRequestCert: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc SMS 인증번호 요청 에러 처
   * @param errorCode
   * @param errorMsg
   * @private
   */
  _checkCertError: function (errorCode, errorMsg) {
    if ( errorCode === this.SMS_ERROR.ATH2003 ) {
      this._showError(null, null, this.$errorCertTime);
    } else if ( errorCode === this.SMS_ERROR.ATH2006 ) {
      this._showError(null, null, this.$errorCertCount);
    } else {
      Tw.Error(errorCode, errorMsg).pop();
    }
  },

  /**
   * @function
   * @desc SMS 인증번호 타이머 설정
   * @param startTime
   */
  _showTimer: function (startTime) {
    var remainedSec = Tw.DateHelper.getRemainedSec(startTime);
    var remainedText = Tw.SMS_VALIDATION.REMAINED_TIME.replace('${value}', Tw.DateHelper.convertMinSecFormat(remainedSec));
    this.$showTime.val(remainedText);
    this.$showTime.attr('aria-hidden',false);
    
    if ( remainedSec <= 0 ) {
      clearInterval(this._addTimer);
    }
  },

  /**
   * @function
   * @desc 시간연장하기 응답 처리
   * @param resp
   * @private
   */
  _successRequestCertAdd: function (resp) {
    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      clearTimeout(this._addTimer);
    }
    this._clearCertError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._showError(null, null, this.$validAddCert);
      if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
        clearInterval(this._addTimer);
      }
      this._addTime = new Date();
      this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);
    } else if ( resp.code === this.SMS_ERROR.ATH1221 ) {
      this._showError(null, null, this.$errorCertAddTime);
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
  _failRequestCertAdd: function (error) {
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc SMS 인증(확인) 클릭 이벤트 처리
   * @private
   */
  _onClickConfirm: function () {
    var type = this.$inputType.filter(':checked').val();
    // type = '1';
    var inputCert = this.$inputCert.val();

    var params = {
      encParamStr: this._encParamStr,
      svcNum: this.mdn,
      authNum: inputCert
    };

    this._getParameter(params, type);
    this._requestConfirm(params);
  },

  /**
   * @function
   * @desc SMS 인증 (확인) API 요청
   * @param params
   * @private
   */
  _requestConfirm: function (params) {
    this._apiService.request(Tw.API_CMD.BFF_08_0076, params)
      .done($.proxy(this._successRequestConfirm, this))
      .fail($.proxy(this._failRequestConfirm, this));
  },

  /**
   * @function
   * @desc SMS 인증 API 응답 처리
   * @param resp
   * @private
   */
  _successRequestConfirm: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.goLoad('/common/auto-sms/result');
    } else if ( resp.code === this.SMS_ERROR.ATH2007 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.NOT_MATCH_CODE, null, null, $.proxy(this._onCloseCertError, this));
    } else if ( resp.code === this.SMS_ERROR.ATH2008 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.EXPIRE_AUTH_TIME, null, null, $.proxy(this._onCloseCertError, this));
    } else if ( resp.code === this.SMS_ERROR.ZNGME0098 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ZNGME0098, null, null, $.proxy(this._onCloseInputError, this));
    } else if ( resp.code === this.SMS_ERROR.ZORDE6044 ) {
      this._popupService.openAlert(Tw.SMS_VALIDATION.ZORDE6044, null, null, $.proxy(this._onCloseInputError, this));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc SMS 인증 API 실패 처리
   * @param error
   * @private
   */
  _failRequestConfirm: function (error) {
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
    // inputBox.addClass('error');
    // input.attr('aria-describedby', error.attr('id'));
    error.removeClass('none');
    // error.attr('aria-hidden', false);
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
    // inputBox.removeClass('error');
    // input.attr('aria-describedby', '');
    error.addClass('none');
    // error.attr('aria-hidden', true);
  },

  /**
   * @function
   * @desc input 에러 삭제
   * @private
   */
  _clearAllError: function () {
    this._clearError(null, null, this.$errorBirth);
  },

  /**
   * @function
   * @desc 인증번호 요청 에러 삭제
   * @private
   */
  _clearCertError: function () {
    this._clearError(null, null, this.$validCert);
    this._clearError(null, null, this.$validRecert);
    this._clearError(null, null, this.$validAddCert);
    this._clearError(null, null, this.$errorCertTime);
    this._clearError(null, null, this.$errorCertCount);
    this._clearError(null, null, this.$errorCertAddTime);
  },

  /**
   * @function
   * @desc 인증번호 에러 팝업 close 콜백
   * @private
   */
  _onCloseCertError: function () {
    this.$inputCert.val('');
    this.$inputCert.focus();
  },

  /**
   * @function
   * @desc 인증번호 입력시간 에러 팝업 close 콜백
   * @private
   */
  _onCloseInputError: function () {
    this.$inputList = this.$container.find('input');
    this.$inputList.val('');
    this.$inputList[0].focus();
  }
};
