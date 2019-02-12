/**
 * FileName: product.mobileplan.join.share-line.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

Tw.ProductMobileplanJoinShareLine = function(rootEl, prodId, displayId, confirmOptions, isOverPayReqYn, isComparePlanYn) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._prodId = prodId;
  this._displayId = displayId;
  this._isOverPayReq = isOverPayReqYn === 'Y';
  this._isComparePlan = isComparePlanYn === 'Y';
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._isSetOverPayReq = false;
  this._overpayRetryCnt = 0;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
};

Tw.ProductMobileplanJoinShareLine.prototype = {

  _cachedElement: function() {
    this.$inputNumber = this.$container.find('.fe-num_input');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnAddressBook = this.$container.find('.fe-btn_address_book');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnAddressBook.on('click', $.proxy(this._openAppAddressBook, this));
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));

    this.$btnSetupOk.on('click', $.proxy(this._reqOverpay, this));
  },

  _openAppAddressBook: function() {
    this._nativeService.send('getContact', {}, $.proxy(this._setAppAddressBook, this));
  },

  _setAppAddressBook: function(res) {
    if (Tw.FormatHelper.isEmpty(res.params.phoneNumber)) {
      return;
    }

    this.$inputNumber.val(res.params.phoneNumber);
    this._toggleSetupButton(this.$inputNumber.val().length > 0);
    this._toggleClearBtn();
  },

  _detectInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9]/g, ''));

    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    this._toggleSetupButton(this.$inputNumber.val().length > 0);
    this._toggleClearBtn();
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _blurInputNumber: function() {
    if (this.$inputNumber.length > 8) {
      this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
    } else {
      this.$inputNumber.val(Tw.FormatHelper.getDashedCellPhoneNumber(this.$inputNumber.val()));
    }
  },

  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  _clearNum: function() {
    this.$inputNumber.val('');
    this.$btnClearNum.hide();
    this._toggleSetupButton(false);
  },

  _toggleClearBtn: function() {
    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show();
    } else {
      this.$btnClearNum.hide();
    }
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      svcProdNm: this._confirmOptions.preinfo.frProdInfo.prodNm,
      svcProdBasFeeInfo: this._confirmOptions.preinfo.frProdInfo.basFeeInfo,
      toProdName: this._confirmOptions.preinfo.toProdInfo.prodNm,
      isNumberBasFeeInfo: !this._confirmOptions.preinfo.toProdInfo.basFeeInfo.isNaN,
      toProdBasFeeInfo: this._confirmOptions.preinfo.toProdInfo.basFeeInfo.value,
      toProdDesc: this._confirmOptions.sktProdBenfCtt,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      autoJoinBenefitList: this._confirmOptions.preinfo.toProdInfo.chgSktProdBenfCtt,
      autoTermBenefitList: this._confirmOptions.preinfo.frProdInfo.chgSktProdBenfCtt,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0 ||
        this._confirmOptions.installmentAgreement.isInstallAgreement),
      isInstallmentAgreement: this._confirmOptions.installmentAgreement.isInstallAgreement,
      downgrade: this._getDowngrade()
    });
  },

  _getDowngrade: function() {
    if (Tw.FormatHelper.isEmpty(this._confirmOptions.downgrade) || Tw.FormatHelper.isEmpty(this._confirmOptions.downgrade.guidMsgCtt)) {
      return null;
    }

    return {
      isHtml: this._confirmOptions.downgrade.htmlMsgYn === 'Y',
      guidMsgCtt: this._confirmOptions.downgrade.guidMsgCtt
    };
  },

  _reqOverpay: function() {
    if (!this._isOverPayReq || this._isSetOverPayReq) {
      this._confirmOptions = $.extend(this._confirmOptions, { isOverPayError: true });
      return this._procConfirm();
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._overpayRetryCnt++;
    this._isSetOverPayReq = true;
    this._apiService.request(Tw.API_CMD.BFF_10_0010)
      .done($.proxy(this._resOverpay, this));
  },

  _resOverpay: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (['ZEQPN0002', 'ZORDN3598'].indexOf(resp.code) !== -1 && this._overpayRetryCnt < 3) { // 최대 3회까지 재조회 시도
      this._isSetOverPayReq = false;
      return this._reqOverpay();
    }

    var overpayResults = {
      isOverpayResult: resp.code === Tw.API_CODE.CODE_00
    };

    if (overpayResults.isOverpayResult) {
      var isDataOvrAmt = parseFloat(resp.result.dataOvrAmt) > 0,
        isVoiceOvrAmt = parseFloat(resp.result.voiceOvrAmt) > 0,
        isSmsOvrAmt = parseFloat(resp.result.smsOvrAmt) > 0;

      if (!isDataOvrAmt && !isVoiceOvrAmt && !isSmsOvrAmt) {
        overpayResults.isOverpayResult = false;
      } else {
        var convDataAmt = Tw.ProductHelper.convDataAmtIfAndBas(resp.result.dataIfAmt, resp.result.dataBasAmt);

        overpayResults = $.extend(overpayResults, {
          isDataOvrAmt: isDataOvrAmt,
          isVoiceOvrAmt: isVoiceOvrAmt,
          isSmsOvrAmt: isSmsOvrAmt,
          dataIfAmt: Tw.FormatHelper.addComma(convDataAmt.dataIfAmt) + convDataAmt.unit,
          dataBasAmt: Tw.FormatHelper.addComma(convDataAmt.dataBasAmt) + convDataAmt.unit,
          dataOvrAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.dataOvrAmt)),
          voiceIfAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.voiceIfAmt)),
          voiceBasAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.voiceBasAmt)),
          voiceOvrAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.voiceOvrAmt)),
          smsIfAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.smsIfAmt)),
          smsBasAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.smsBasAmt)),
          smsOvrAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.smsOvrAmt)),
          ovrTotAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.ovrTotAmt))
        });
      }
    }

    this._confirmOptions = $.extend(this._confirmOptions, {
      isOverpayResult: overpayResults.isOverpayResult,
      overpay: overpayResults
    });

    this._procConfirm();
  },

  _procConfirm: function() {
    if (!Tw.ValidationHelper.isCellPhone(this.$inputNumber.val())) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    new Tw.ProductCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: true,
      isNoticeList: true,
      isComparePlan: this._isComparePlan,
      noticeList: $.merge(this._confirmOptions.preinfo.termNoticeList, this._confirmOptions.preinfo.joinNoticeList),
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
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0012, {
      asgnNumList: [this.$inputNumber.val().replace(/[^0-9]/g, '')],
      svcProdGrpId: Tw.FormatHelper.isEmpty(this._confirmOptions.preinfo.svcProdGrpId) ? '' : this._confirmOptions.preinfo.svcProdGrpId
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this));
  },

  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    setTimeout($.proxy(this._openSuccessPop, this), 100);
  },

  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
        btList: [{ link: '/myt-join/myplan', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.toProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
          this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
