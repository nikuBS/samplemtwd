/**
 * @file product.mobileplan-add.join.payment.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.11.21
 */

Tw.ProductMobileplanAddJoinPayment = function(rootEl, prodId, displayId, confirmOptions) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-btn_setup_ok'));
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));

  this._sendCount = 0;
  this._isSend = false;
  this._isFirstSend = false;
  this._nextEnableSendTime = null;
  this._validatedNumber = null;
  this._receiveNum = null;
  this._addTimer = null;
  this._addTime = null;
  this._seqNo = null;

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }

  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
  this._getMethodBlock();
};

Tw.ProductMobileplanAddJoinPayment.prototype = {

  _getMethodBlock: function () {
    this._apiService.request(Tw.NODE_CMD.GET_AUTH_METHOD_BLOCK, {})
      .done($.proxy(this._successGetAuthMethodBlock, this));
  },

  _successGetAuthMethodBlock: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._authBlock = this._parseAuthBlock(resp.result);
    }
    if ( this._authBlock[Tw.AUTH_CERTIFICATION_METHOD.SK_SMS] === 'Y' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.MSG, Tw.ALERT_MSG_COMMON.CERT_ADMIN_BLOCK.TITLE,
        null, $.proxy(this._onCloseBlockPopup, this));
    }
  },

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

  _onCloseBlockPopup: function () {
    this._historyService.goBack();
  },

  _cachedElement: function() {
    this.$inputNumber = this.$container.find('.fe-input_num');
    this.$inputAuthCode = this.$container.find('.fe-input_auth_code');

    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnGetAuthCode = this.$container.find('.fe-btn_get_auth_code');
    this.$btnValidate = this.$container.find('.fe-btn_validate');
    this.$btnExtend = this.$container.find('.fe-btn_extend');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');

    this.$smsTime = this.$container.find('.fe-sms_time');
    this.$sendMsgResult = this.$container.find('.fe-send_msg_result');
    this.$validateResult = this.$container.find('.fe-validate_result');
  },

  _bindEvent: function() {
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));
    this.$inputAuthCode.on('keyup input', $.proxy(this._detectInputAuthCode, this));

    this.$btnExtend.on('click', $.proxy(this._extendTime, this));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnGetAuthCode.on('click', $.proxy(this._getAuthCode, this));
    this.$btnValidate.on('click', $.proxy(this._reqValidateAuthCode, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));
  },

  _detectInputNumber: function(e) {
    var onlyNumber = this.$inputNumber.val();

    this.$inputNumber.val('');
    this.$inputNumber.val(onlyNumber);
    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9]/g, ''));

    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    this._toggleClearBtn($(e.currentTarget));
    this._toggleButton(this.$btnGetAuthCode, this.$inputNumber.val().length > 9);
    this.$btnGetAuthCode.parent().toggleClass('disabled', this.$inputNumber.val().length < 10);
  },

  _getAuthCode: function() {
    var number = this.$inputNumber.val().replace(/-/gi, '');

    if (!Tw.ValidationHelper.isCellPhone(number)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    this.$inputNumber.attr('aria-describedby', '');

    if (this._isFirstSend && (new Date().getTime() > this._expireSendTime) && this._sendCount > 4) {
      return this._setSendResultText(true, Tw.SMS_VALIDATION.EXPIRE_NEXT_TIME);
    }

    if (!Tw.FormatHelper.isEmpty(this._nextEnableSendTime) && (this._nextEnableSendTime > new Date().getTime())) {
      return this._setSendResultText(true, Tw.SMS_VALIDATION.WAIT_NEXT_TIME);
    }

    this.$sendMsgResult.hide().attr('aria-hidden', 'true');
    this._receiveNum = number;

    if ( Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.READY_SMS, {}, $.proxy(this._onReadSms, this));
    } else {
      this._getAuthCodeReq(false);
    }
  },

  _onReadSms: function () {
    this._getAuthCodeReq(false);
  },

  _getAuthCodeReq: function(isExtend) {
    this._apiService.request(Tw.API_CMD.BFF_01_0059, {
      jobCode: Tw.BrowserHelper.isApp() ? 'NFM_MTW_SFNTPR2_AUTH' : 'NFM_MWB_SFNTPRT_AUTH',
      receiverNum: this._receiveNum
    }).done($.proxy(this._resAuthCode, this, isExtend));
  },

  _setSendResultText: function(isError, text) {
    this.$container.find('.fe-send_result_msg').remove();
    this.$sendMsgResult.html($('<span\>').addClass('fe-send_result_msg')
      .addClass(isError ? 'error-txt' : 'validation-txt').text(text));
    this.$sendMsgResult.show().attr('aria-hidden', 'false').focus();
    this.$inputNumber.attr('aria-describedby', 'aria-sms-exp-desc1');
  },

  _extendTime: function() {
    this._apiService.request(Tw.API_CMD.BFF_03_0027, {
      seqNo: this._seqNo
    }).done($.proxy(this._resAuthCode, this, true));
  },

  _showTimer: function (startTime) {
    var remainedSec = Tw.DateHelper.getRemainedSec(startTime);

    this.$smsTime.text(Tw.DateHelper.convertMinSecFormat(remainedSec));
    this.$smsTime.show().attr('aria-hidden', 'false');

    if ( remainedSec <= 0 ) {
      clearInterval(this._addTimer);
    }
  },

  _resAuthCode: function(isExtend, resp) {
    if (resp.code === 'ATH2003') {
      return this._setSendResultText(true, Tw.SMS_VALIDATION.WAIT_NEXT_TIME);
    }

    if (resp.code === 'ATH2006') {
      return this._setSendResultText(true, Tw.SMS_VALIDATION.EXPIRE_NEXT_TIME);
    }

    if (resp.code === 'ATH1221') {
      return this._setValidateResultText(true, Tw.SMS_VALIDATION.ATH1221);
    }

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._setSendResultText(true, resp.msg);
    }

    if ( !isExtend ) {
      this._isSend = true;
      this._seqNo = resp.result.seqNo;
      this.$inputAuthCode.val('');
      this.$btnGetAuthCode.text(Tw.BUTTON_LABEL.SMS_RESEND);
      this._toggleButton(this.$btnExtend, true);
      this._toggleButton(this.$btnValidate, false);
      this._setSendResultText(false, Tw.SMS_VALIDATION.SUCCESS_SEND);
      this._getCertNum();
    } else {
      this._setValidateResultText(false, Tw.SMS_VALIDATION.SUCCESS_EXPIRE);
    }

    if ( !Tw.FormatHelper.isEmpty(this._addTimer) ) {
      clearInterval(this._addTimer);
    }

    this._addTime = new Date();
    this._addTimer = setInterval($.proxy(this._showTimer, this, this._addTime), 1000);

    this._sendCount++;
    this._nextEnableSendTime = new Date().getTime() + 60000;

    if (!this._isFirstSend) {
      this._isSend = true;
      this._isFirstSend = true;
      this._expireSendTime = new Date().getTime() + (60000 * 5);
    }
  },

  _getCertNum: function () {
    if ( Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.GET_CERT_NUMBER, {}, $.proxy(this._onCertNum, this));
    }
  },

  _onCertNum: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this.$inputAuthCode.val(resp.params.cert);
      this._detectInputAuthCode();
    }
  },

  _detectInputAuthCode: function() {
    var onlyNumber = this.$inputAuthCode.val();

    this.$inputAuthCode.val('');
    this.$inputAuthCode.val(onlyNumber);
    this.$inputAuthCode.val(this.$inputAuthCode.val().replace(/[^0-9]/g, ''));

    if (this.$inputAuthCode.val().length > 6) {
      this.$inputAuthCode.val(this.$inputAuthCode.val().substr(0, 6));
    }

    this._toggleClearBtn(this.$inputAuthCode);
    this._toggleButton(this.$btnValidate, this.$inputAuthCode.val() > 0);
  },

  _reqValidateAuthCode: function() {
    this._apiService.request(Tw.API_CMD.BFF_01_0063, {
      jobCode: Tw.BrowserHelper.isApp() ? 'NFM_MTW_SFNTPR2_AUTH' : 'NFM_MWB_SFNTPRT_AUTH',
      receiverNum: this.$inputNumber.val().replace(/-/gi, ''),
      authNum: this.$inputAuthCode.val()
    }).done($.proxy(this._resValidateAuthCode, this));
  },

  _resValidateAuthCode: function(resp) {
    this.$inputAuthCode.attr('aria-describedby', '');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._setValidateResultText(true, this._replaceErrMsg(resp.code, resp.msg));
    }

    this._isSend = false;
    this._validatedNumber = this.$inputNumber.val().replace(/-/gi, '');

    clearInterval(this._addTimer);
    this.$smsTime.hide().attr('aria-hidden', 'true');
    this._toggleButton(this.$btnExtend, false);

    this._setValidateResultText(false, Tw.SMS_VALIDATION.SUCCESS);
    this._toggleButton(this.$btnValidate, false);
    this._toggleButton(this.$btnSetupOk, true);
  },

  _replaceErrMsg: function(code, msg) {
    if (code === 'ATH2003') {
      return Tw.SMS_VALIDATION.WAIT_NEXT_TIME;
    }

    if (code === 'ATH2006') {
      return Tw.SMS_VALIDATION.EXPIRE_NEXT_TIME;
    }

    if (code === 'ATH2007') {
      return Tw.SMS_VALIDATION.NOT_MATCH_CODE;
    }

    if (code === 'ATH2008') {
      return Tw.SMS_VALIDATION.EXPIRE_AUTH_TIME;
    }

    if (code === 'ATH2013') {
      return Tw.SMS_VALIDATION.ALREADY_AUTH;
    }

    return msg;
  },

  _setValidateResultText: function(isError, text) {
    this.$container.find('.fe-send_result_msg').remove();
    this.$validateResult.html($('<span\>').addClass('fe-send_result_msg')
      .addClass(isError ? 'error-txt' : 'validation-txt').text(text));
    this.$validateResult.show().attr('aria-hidden', 'false').focus();
    this.$inputAuthCode.attr('aria-describedby', 'aria-sms-exp-desc2');
  },

  _toggleButton: function($button, isEnable) {
    if (isEnable) {
      $button.removeAttr('disabled').removeClass('disabled').prop('disabled', false);
    } else {
      $button.attr('disabled', 'disabled').addClass('disabled').prop('disabled', true);
    }
  },

  _blurInputNumber: function() {
    this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
  },

  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  _clearNum: function(e) {
    var $btnClear = $(e.currentTarget),
      $input = $btnClear.parent().find('input');

    if ($input.hasClass('fe-input_num')) {
      this._toggleButton(this.$btnGetAuthCode, false);
    }

    if ($input.hasClass('fe-input_auth_code')) {
      this._toggleButton(this.$btnValidate, false);
    }

    $input.val('');
    $input.parents('.form-cell').find('.fe-msg').hide();
    $btnClear.hide().attr('aria-hidden', 'true');
  },

  _toggleClearBtn: function($input) {
    var $btnClear = $input.parent().find('.fe-btn_clear_num');
    if ($input.val().length > 0) {
      $btnClear.show().attr('aria-hidden', 'false');
    } else {
      $btnClear.hide().attr('aria-hidden', 'true');
    }
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN,
      isMobilePlan: false,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0)
    });
  },

  _procConfirm: function() {
    new Tw.ProductCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: false,
      noticeList: this._confirmOptions.preinfo.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A3,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId] + ' ' + Tw.FormatHelper.getFormattedPhoneNumber(this._validatedNumber)
      }]
    }), $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0018, {
      svcNumList: [this._getServiceNumberFormat(this._validatedNumber)]
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _getServiceNumberFormat: function(number) {
    if (number.length === 10) {
      return {
        serviceNumber1: number.substr(0, 3),
        serviceNumber2: number.substr(3, 3),
        serviceNumber3: number.substr(6, 4)
      };
    }

    return {
      serviceNumber1: number.substr(0, 3),
      serviceNumber2: number.substr(3, 4),
      serviceNumber3: number.substr(7, 4)
    };
  },

  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_10_0038, {
      scrbTermCd: 'S'
    }, {}, [this._prodId]).done($.proxy(this._isVasTerm, this));
  },

  _isVasTerm: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openVasTermPopup(resp.result);
  },

  _openSuccessPop: function() {
    if (!this._isResultPop) {
      return;
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
          this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _openVasTermPopup: function(respResult) {
    var popupOptions = {
      hbs: 'MV_01_02_02_01',
      bt: [
        {
          style_class: 'unique fe-btn_back',
          txt: Tw.BUTTON_LABEL.CLOSE
        }
      ]
    };

    if (respResult.prodTmsgTypCd === 'H') {
      popupOptions = $.extend(popupOptions, {
        editor_html: Tw.CommonHelper.replaceCdnUrl(respResult.prodTmsgHtmlCtt)
      });
    }

    if (respResult.prodTmsgTypCd === 'I') {
      popupOptions = $.extend(popupOptions, {
        img_url: respResult.rgstImgUrl,
        img_src: Tw.Environment.cdn + respResult.imgFilePathNm
      });
    }

    this._isResultPop = true;
    this._popupService.open(popupOptions, $.proxy(this._bindVasTermPopupEvent, this), $.proxy(this._openSuccessPop, this), 'vasterm_pop');
  },

  _bindVasTermPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndOpenResultPopup: function() {
    this._isResultPop = true;
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
