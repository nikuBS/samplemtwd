/**
 * FileName: product.mobileplan.join.tplan.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.09
 */

Tw.ProductMobileplanJoinTplan = function(rootEl, prodId, displayId, confirmOptions, isOverPayReqYn, isComparePlanYn) {
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

Tw.ProductMobileplanJoinTplan.prototype = {

  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnSetupOk.on('click', $.proxy(this._reqOverpay, this));
  },

  _enableSetupButton: function() {
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      svcNumMask: this._confirmOptions.preinfo.svcNumMask,
      svcProdNm: this._confirmOptions.preinfo.frProdInfo.prodNm,
      svcProdBasFeeInfo: this._confirmOptions.preinfo.frProdInfo.basFeeInfo,
      toProdName: this._confirmOptions.preinfo.toProdInfo.prodNm,
      isNumberBasFeeInfo: !this._confirmOptions.preinfo.toProdInfo.basFeeInfo.isNaN,
      toProdBasFeeInfo: this._confirmOptions.preinfo.toProdInfo.basFeeInfo.value,
      toProdDesc: this._confirmOptions.sktProdBenfCtt,
      isAutoJoinTermList: (this._confirmOptions.preinfo.autoJoinList.length > 0 || this._confirmOptions.preinfo.autoTermList.length > 0),
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      autoJoinBenefitList: this._confirmOptions.preinfo.frProdInfo.chgSktProdBenfCtt,
      autoTermBenefitList: this._confirmOptions.preinfo.toProdInfo.chgSktProdBenfCtt,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0)
    });
  },

  _reqOverpay: function() {
    if (!this._isOverPayReq || this._isSetOverPayReq) {
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
        overpayResults = $.extend(overpayResults, {
          isDataOvrAmt: isDataOvrAmt,
          isVoiceOvrAmt: isVoiceOvrAmt,
          isSmsOvrAmt: isSmsOvrAmt
        });
      }
    }

    this._confirmOptions = $.extend(this._confirmOptions, overpayResults);
    this._procConfirm();
  },

  _procConfirm: function() {
    new Tw.ProductCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: true,
      isComparePlan: this._isComparePlan,
      noticeList: this._confirmOptions.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.CHANGE,
      typeText: Tw.PRODUCT_CTG_NM.PLANS,
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A2,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: this.$container.find('.widget-box.radio input[type="radio"]:checked').attr('title')
      }]
    }), $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    // Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0012, {
      asgnNumList: [],
      optProdId: this.$container.find('.widget-box.radio input[type="radio"]:checked').val(),
      svcProdGrpId: ''
    }, {}, this._prodId).done($.proxy(this._procJoinRes, this));
  },

  _procJoinRes: function(resp) {
    // Tw.CommonHelper.endLoading('.container');

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
        mytPage: 'myplan',
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
