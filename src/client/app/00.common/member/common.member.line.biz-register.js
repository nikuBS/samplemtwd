/**
 * FileName: common.member.line.biz-register.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.27
 */

Tw.CommonMemberLineBizRegister = function (rootEl) {

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._nicknamePopup = new Tw.NicknameComponent();
  this._historyService = new Tw.HistoryService();

  this.$inputMdn = null;
  this.$inputCop = null;
  this.$inputCopNum = null;
  this.$inputNickname = null;
  this._nickName = '';

  this._jobCode = Tw.BrowserHelper.isApp() ? 'NFM_MTW_MBRADDL_AUTH' : 'NFM_WBZ_MBRADDL_AUTH';
  this._cachedElement();
  this._bindEvent();
};

Tw.CommonMemberLineBizRegister.prototype = {
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
  ERROR_CODE: {
    ATH0020: 'ATH0020',     // 법인회선아님
    ATH0021: 'ATH0021',     // SWING 법인실사용자 등록 회선 (수동등록 불가)
    ATH0022: 'ATH0022',	    // 입력 정보 불일치 - 명의자 법인명 불일치
    ATH0023: 'ATH0023',     // 입력 정보 불일치 - 명의자 법인명 불일치
    ICAS4027: 'ICAS4027',
    ICAS3356: 'ICAS3356'
  },

  _cachedElement: function () {
    this.$inputMdn = this.$container.find('#fe-input-mdn');
    this.$inputCop = this.$container.find('#fe-input-cop');
    this.$inputCopNum = this.$container.find('#fe-input-cop-number');
    this.$inputNickname = this.$container.find('#fe-input-nickname');
    this.$btConfirm = this.$container.find('#fe-bt-confirm');

    this.$inputMdn = this.$container.find('#fe-input-mdn');
    this.$inputCert = this.$container.find('#fe-input-cert');
    this.$btCert = this.$container.find('#fe-bt-cert');
    this.$btReCert = this.$container.find('#fe-bt-recert');
    this.$btCertAdd = this.$container.find('#fe-bt-cert-add');
    this.$showTime = this.$container.find('#fe-sms-time');

    this.$inputboxMdn = this.$container.find('#fe-inputbox-mdn');
    this.$inputboxCert = this.$container.find('#fe-inputbox-cert');

    this.$validSendCert = this.$container.find('#aria-cert-num2');
    this.$validAddCert = this.$container.find('#aria-cert-num1');
    this.$errorCertTime = this.$container.find('#aria-cert-num3');
    this.$errorCertCount = this.$container.find('#aria-cert-num4');
    this.$errorCertAddTime = this.$container.find('#aria-cert-num5');
    this.$errorCertBlock = this.$container.find('#aria-cert-num6');
    this.$errorConfirmCert = this.$container.find('#aria-phone-err1');
    this.$errorConfirmTime = this.$container.find('#aria-phone-err2');
    this.$errorConfirmCnt = this.$container.find('#aria-phone-err3');
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-nickname', $.proxy(this._onClickNickname, this));

    this.$btConfirm.on('click', $.proxy(this._onClickRegister, this));
    this.$inputMdn.on('input', $.proxy(this._onInputMdn, this));
    this.$inputCop.on('input', $.proxy(this._onInputCop, this));
    this.$inputCopNum.on('input', $.proxy(this._onInputCopNum, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));
    this.$inputNickname.on('click', $.proxy, $.proxy(this._onClickNickname, this));

    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btReCert.on('click', $.proxy(this._onClickReCert, this));
    this.$btCertAdd.on('click', $.proxy(this._onClickCertAdd, this));

    this.$container.on('click', '.fe-bt-cop-delete', $.proxy(this._onInputCop, this));
    this.$container.on('click', '.fe-bt-cop-num-delete', $.proxy(this._onInputCopNum, this));
    this.$container.on('click', '.fe-bt-mdn-delete', $.proxy(this._onInputMdn, this));
    this.$container.on('click', '.fe-bt-cert-delete', $.proxy(this._onInputCert, this));

    new Tw.InputFocusService(this.$container, this.$btConfirm);
  },
  _onClickNickname: function () {
    this._nicknamePopup.openNickname('', null, $.proxy(this._onCloseNickname, this));
  },
  _onClickRegister: function ($event) {
    var $target = $($event.currentTarget);
    this._sendConfirmCert($target);
  },
  _onInputCop: function () {
    this._isEnableConfirm();
  },
  _onInputCopNum: function ($event) {
    if ( !Tw.FormatHelper.isEmpty($event) ) {
      Tw.InputHelper.inputNumberOnly($event.target);
    }
    this._isEnableConfirm();
  },
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
    this._isEnableConfirm();
  },
  _onInputCert: function ($event) {
    if ( !Tw.FormatHelper.isEmpty($event) ) {
      Tw.InputHelper.inputNumberOnly($event.target);
    }
    var inputCert = this.$inputCert.val();
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
      this.$inputCert.val(inputCert.slice(0, Tw.DEFAULT_CERT_LEN));
    }
    this._isEnableConfirm();
  },
  _isEnableConfirm: function () {
    var inputCert = this.$inputCert.val();
    var inputMdn = this.$inputMdn.val();
    var mdnLength = inputMdn ? inputMdn.length : 0;
    if ( (mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN) && !Tw.FormatHelper.isEmpty(this.$inputCop.val()) &&
      !Tw.FormatHelper.isEmpty(this.$inputCopNum.val()) && inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
      this.$btConfirm.attr('disabled', false);
    } else {
      this.$btConfirm.attr('disabled', true);
    }
  },
  _onClickCert: function ($event) {
    var $target = $($event.currentTarget);
    this._sendBizSession(false, $target);
  },
  _onClickReCert: function ($event) {
    var $target = $($event.currentTarget);
    this._sendBizSession(true, $target);
  },
  _sendBizSession: function (reCert, $target) {
    var params = {
      svcNum: this.$inputMdn.val(),
      ctzCorpNm: this.$inputCop.val(),
      ctzCorpNum: this.$inputCopNum.val()
    };
    this._apiService.request(Tw.API_CMD.BFF_03_0012, params)
      .done($.proxy(this._successBizSession, this, reCert, $target));
  },
  _successBizSession: function (reCert, $target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcMgmtNum = resp.result.svcMgmtNum;
      this._sendCert(reCert, $target);
    } else {
      this._handleError(resp.code, resp.msg, $target);
    }
  },

  _onClickCertAdd: function ($event) {
    var $target = $($event.currentTarget);
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this.certSeq })
      .done($.proxy(this._successRequestCertAdd, this, $target));
  },
  _sendCert: function (reCert, $target) {
    if ( Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.READY_SMS, {}, $.proxy(this._onReadSms, this, reCert, $target));
    } else {
      this._sendCertApi(reCert, $target);
    }
  },
  _onReadSms: function (reCert, $target, resp) {
    this._sendCertApi(reCert, $target);
  },
  _sendCertApi: function (reCert, $target) {
    this.mdn = this.$inputMdn.val();
    var params = {
      jobCode: this._jobCode,
      receiverNum: this.mdn
    };
    this._apiService.request(Tw.API_CMD.BFF_01_0059, params, {}, [this.mdn])
      .done($.proxy(this._successRequestCert, this, reCert, $target));
  },
  _successRequestCert: function (reCert, $target, resp) {
    this._clearCertError();
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.certSeq = resp.result.seqNo;
      this.$btCertAdd.attr('disabled', false);
      this._getCertNum();
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
  _getCertNum: function () {
    if ( Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.GET_CERT_NUMBER, {}, $.proxy(this._onCertNum, this));
    }
  },
  _onCertNum: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this.$inputCert.val(resp.params.cert);
      this._onInputCert();
    }
  },
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
  _successRequestCertAdd: function ($target, resp) {
    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      clearTimeout(this._addTimer);
    }
    this._clearCertError();
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
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },
  _sendConfirmCert: function ($target) {
    var inputCert = this.$inputCert.val();
    var params = {
      authNum: inputCert,
      jobCode: this._jobCode,
      receiverNum: this.mdn
    };
    this._apiService.request(Tw.API_CMD.BFF_01_0063, params)
      .done($.proxy(this._successConfirmCert, this, $target));
  },
  _successConfirmCert: function ($target, resp) {
    this._clearConfirmError();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._sendRegisterBiz($target);
    } else if ( resp.code === this.SMS_ERROR.ATH2007 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCert);
    } else if ( resp.code === this.SMS_ERROR.ATH2008 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorConfirmTime);
    } else if ( resp.code === this.SMS_ERROR.ATH2011 ) {
      this._showError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCnt);
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
  _sendRegisterBiz: function ($target) {
    var params = {
      svcMgmtNum: this._svcMgmtNum
    };
    if ( !Tw.FormatHelper.isEmpty(this._nickName) ) {
      params.nickNm = this._nickName;
    }
    this._apiService.request(Tw.API_CMD.BFF_03_0013, params)
      .done($.proxy(this._successRegisterBiz, this, $target))
      .fail($.proxy(this._failRegisterBiz, this));
  },
  _successRegisterBiz: function ($target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {})
        .done($.proxy(this._successUpdateSvc, this));
    } else if ( resp.code === this.ERROR_CODE.ICAS4027 || resp.code === this.ERROR_CODE.ICAS3356 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_A8, null, null, null, null, $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },
  _successUpdateSvc: function (resp) {
    this._historyService.goBack();
  },
  _failRegisterBiz: function (error) {
    Tw.Logger.error(error);
  },
  _onCloseNickname: function (nickname) {
    this._nickName = nickname;
    this.$inputNickname.val(nickname);
  },
  _handleError: function (code, message, $target) {
    if ( code === this.ERROR_CODE.ATH0020 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_A7, null, null, null, null, $target);
    } else if ( code === this.ERROR_CODE.ATH0021 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_A8, null, null, null, null, $target);
    } else if ( code === this.ERROR_CODE.ATH0022 && code === this.ERROR_CODE.ATH0023 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_A7, null, null, null, null, $target);
    } else {
      Tw.Error(code, message).pop(null, $target);
    }
  },
  _showError: function (inputBox, input, error) {
    inputBox.addClass('error');
    input.attr('aria-describedby', error.attr('id'));
    error.removeClass('none');
    error.attr('aria-hidden', false);
  },
  _clearError: function (inputBox, input, error) {
    inputBox.removeClass('error');
    input.attr('aria-describedby', '');
    error.addClass('none');
    error.attr('aria-hidden', true);
  },

  _clearCertError: function () {
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$validSendCert);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertTime);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertCount);
    this._clearError(this.$inputboxMdn, this.$inputMdn, this.$errorCertBlock);
  },
  _clearConfirmError: function () {
    this._clearError(this.$inputboxCert, this.$inputCert, this.$validAddCert);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorCertAddTime);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCert);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorConfirmTime);
    this._clearError(this.$inputboxCert, this.$inputCert, this.$errorConfirmCnt);
  }
};
