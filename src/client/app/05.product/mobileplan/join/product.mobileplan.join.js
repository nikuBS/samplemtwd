/**
 * 상품 가입 - 모바일 요금제
 * FileName: product.mobileplan.join.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

Tw.ProductMobileplanJoin = function(rootEl, prodId, confirmOptions, isOverPayReqYn) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._isOverPayReq = isOverPayReqYn === 'Y';
  this._confirmOptions = JSON.parse(confirmOptions);
  this._isSetOverPayReq = false;
  this._overpayRetryCnt = 0;

  this._init();
};

Tw.ProductMobileplanJoin.prototype = {

  _init: function() {
    this._convConfirmOptions();
    this._reqOverpay();
  },

  _reqOverpay: function() {
    if (!this._isOverPayReq || this._isSetOverPayReq) {
      return this._getJoinConfirmContext();
    }

    this._overpayRetryCnt++;
    this._isSetOverPayReq = true;
    this._apiService.request(Tw.API_CMD.BFF_10_0010)
      .done($.proxy(this._resOverpay, this));
  },

  _resOverpay: function(resp) {
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
    this._bindEvent();
  },

  _bindEvent: function() {
    $(window).on('env', $.proxy(this._getJoinConfirmContext, this));
  },

  _getJoinConfirmContext: function() {
    $.get(Tw.Environment.cdn + '/hbs/product_common_confirm.hbs', $.proxy(this._setConfirmBodyIntoContainer, this));
  },

  _setConfirmBodyIntoContainer: function(context) {
    var tmpl = Handlebars.compile(context),
      html = tmpl(this._confirmOptions);

    this.$container.html(html);
    this._callConfirmCommonJs();
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN,
      isMobilePlan: true,
      joinTypeText: Tw.PRODUCT_TYPE_NM.CHANGE,
      typeText: Tw.PRODUCT_CTG_NM.PLANS,
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A2,
      svcProdNm: this._confirmOptions.preinfo.frProdInfo.prodNm,
      svcProdBasFeeInfo: this._confirmOptions.preinfo.frProdInfo.basFeeInfo,
      toProdName: this._confirmOptions.preinfo.toProdInfo.prodNm,
      isNumberBasFeeInfo: !this._confirmOptions.preinfo.toProdInfo.basFeeInfo.isNaN,
      toProdBasFeeInfo: this._confirmOptions.preinfo.toProdInfo.basFeeInfo.value,
      toProdDesc: this._confirmOptions.sktProdBenfCtt,
      autoJoinBenefitList: this._confirmOptions.preinfo.frProdInfo.chgSktProdBenfCtt,
      autoTermBenefitList: this._confirmOptions.preinfo.toProdInfo.chgSktProdBenfCtt,
      svcNumMask: this._confirmOptions.preinfo.svcNumMask,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAutoJoinTermList: (this._confirmOptions.preinfo.autoJoinList.length > 0 || this._confirmOptions.preinfo.autoTermList.length > 0),
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.stipulation.existsCount > 0)
    });
  },

  _callConfirmCommonJs: function() {
    new Tw.ProductCommonConfirm(false, this.$container, {
      isWidgetInit: true
    }, $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    // prodId: this._prodId,
    //   prodProcTypeCd: 'JN'

    this._apiService.request(Tw.API_CMD.BFF_10_0012, {
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

