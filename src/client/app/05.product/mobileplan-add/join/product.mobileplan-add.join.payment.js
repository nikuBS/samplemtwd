/**
 * FileName: product.mobileplan-add.join.payment.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.21
 */

Tw.ProductMobileplanAddJoinPayment = function(rootEl, prodId, displayId, confirmOptions) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(confirmOptions);

  this._sendCount = 0;
  this._isSend = false;
  this._isFirstSend = false;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
};

Tw.ProductMobileplanAddJoinPayment.prototype = {

  _cachedElement: function() {
    this.$inputNumber = this.$container.find('.fe-input_num');
    this.$inputAuthCode = this.$container.find('.fe-input_auth_code');

    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnGetAuthCode = this.$container.find('.fe-btn_get_auth_code');
    this.$btnValidate = this.$container.find('.fe-btn_validate');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');

    this.$sendMsgResult = this.$container.find('.fe-send_msg_result');
    this.$validateResult = this.$container.find('.fe-validate_result');
  },

  _bindEvent: function() {
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));
    this.$inputAuthCode.on('keyup input', $.proxy(this._detectInputAuthCode, this));

    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnGetAuthCode.on('click', $.proxy(this._getAuthCode, this));
    this.$btnValidate.on('click', $.proxy(this._reqValidateAuthCode, this));
    this.$btnSetupOk.on('click', $.proxy(this._procConfirm, this));
  },

  _detectInputNumber: function(e) {
    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9.]/g, ''));
    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    this._toggleClearBtn($(e.currentTarget));
    this._toggleButton(this.$btnGetAuthCode, this.$inputNumber.val() > 0);
  },

  _getAuthCode: function() {
    var number = this.$inputNumber.val().replace(/-/gi, '');

    if (!Tw.ValidationHelper.isCellPhone(number)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    if (this._isFirstSend && (new Date().getTime() > this._expireSendTime) && this._sendCount > 4) {
      return this._setSendResultText(true, Tw.SMS_VALIDATION.EXPIRE_NEXT_TIME);
    }

    this.$sendMsgResult.hide();

    $.get('/mock/BFF_01_0058.json')
      .done($.proxy(this._resAuthCode, this));

    // this._apiService.request(Tw.API_CMD.BFF_01_0058, {
    //   receiverNum: number
    // }).done($.proxy(this._resAuthCode, this));
  },

  _setSendResultText: function(isError, text) {
    this.$sendMsgResult.html($('<span\>').addClass(isError ? 'error-txt' : 'validation-txt').text(text));
    this.$container.find('.fe-send_result_msg').remove();
    this.$sendMsgResult.show();
  },

  _resAuthCode: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._setSendResultText(true, resp.msg);
    }

    this._setSendResultText(false, Tw.SMS_VALIDATION.SUCCESS_SEND);

    this._sendCount++;
    if (!this._isFirstSend) {
      this._isSend = true;
      this._isFirstSend = true;
      this._expireSendTime = new Date().getTime() + (3600 * 5);
    }
  },

  _detectInputAuthCode: function(e) {
    if (!this._isSend) {
      return;
    }

    this.$inputAuthCode.val(this.$inputAuthCode.val().replace(/[^0-9.]/g, ''));
    if (this.$inputAuthCode.val().length > 6) {
      this.$inputAuthCode.val(this.$inputAuthCode.val().substr(0, 6));
    }

    this._toggleClearBtn($(e.currentTarget));
    this._toggleButton(this.$btnValidate, this.$inputAuthCode.val() > 0);
  },

  _reqValidateAuthCode: function() {
    this._apiService.request(Tw.API_CMD.BFF_01_0063, {
      authNum: this.$inputAuthCode.val()
    }).done($.proxy(this._resValidateAuthCode, this));
  },

  _resValidateAuthCode: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._setValidateResultText(true, resp.msg);
    }

    // @todo 인증 성공 후 동작 확인 중
  },

  _setValidateResultText: function(isError, text) {
    this.$validateResult.html($('<span\>').addClass(isError ? 'error-txt' : 'validation-txt').text(text));
    this.$container.find('.fe-send_result_msg').remove();
    this.$validateResult.show();
  },

  _toggleButton: function($button, isEnable) {
    if (isEnable) {
      $button.removeAttr('disabled').prop('disabled', false);
    } else {
      $button.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _blurInputNumber: function() {
    this.$inputNumber.val(Tw.FormatHelper.getDashedCellPhoneNumber(this.$inputNumber.val()));
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
    $btnClear.hide();
  },

  _toggleClearBtn: function($input) {
    var $btnClear = $input.parent().find('.fe-btn_clear_num');
    if ($input.val().length > 0) {
      $btnClear.show();
    } else {
      $btnClear.hide();
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
      svcNumMask: this._confirmOptions.preinfo.svcNumMask,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAutoJoinTermList: (this._confirmOptions.preinfo.autoJoinList.length > 0 || this._confirmOptions.preinfo.autoTermList.length > 0),
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0)
    });
  },

  _procConfirm: function() {
    if (!Tw.ValidationHelper.isCellPhone(this.$inputNumber.val())) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    new Tw.ProductCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: true,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.PLANS,
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A2,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId] + ' 1' + Tw.PRODUCT_JOIN_SETTING_AREA_CASE.LINE
      }]
    }), $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    // prodId: this._prodId,
    //   prodProcTypeCd: 'JN',

    this._apiService.request(Tw.API_CMD.BFF_10_0012, {
      asgnNumList: [this.$inputNumber.val().replace(/[^0-9.]/g, '')],
      svcProdGrpId: Tw.FormatHelper.isEmpty(this._confirmOptions.preinfo.svcProdGrpId) ? '' : this._confirmOptions.preinfo.svcProdGrpId
    }, {}, this._prodId).done($.proxy(this._procJoinRes, this));
  },

  _procJoinRes: function(resp) {
    skt_landing.action.loading.off({ ta: '.container' });

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    $.when(this._popupService.close())
      .then($.proxy(this._openSuccessPop, this));
  },

  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
        mytPage: 'fee-plan',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.toProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.preinfo.toProdInfo.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.preinfo.toProdInfo.isNumberBasFeeInfo ?
          this._confirmOptions.preinfo.toProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
  },

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
