/**
 * FileName: benefit.dis-pgm.input.js
 * Author: Kim In Hwan (skt.P132150@partner.sk.com)
 * Date: 2018.12.18
 */

Tw.BenefitDisPgmInput = function (rootEl, prodId, confirmOptions, selType) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._selType = selType;

  this._init();
};

Tw.BenefitDisPgmInput.prototype = {

  _init: function () {
    if ( this._selType ) {
      var data = {};
      var curDate = new Date();
      var nextDate_1 = new Date(curDate.getFullYear() + 1, curDate.getMonth(), curDate.getDate() - 1);
      var nextDate_2 = new Date(curDate.getFullYear() + 2, curDate.getMonth(), curDate.getDate() - 1);
      data.monthDetail = {
        'M0012': Tw.DateHelper.getShortDateNoDot(curDate) + ' ~ ' + Tw.DateHelper.getShortDateNoDot(nextDate_1),
        'M0024': Tw.DateHelper.getShortDateNoDot(curDate) + ' ~ ' + Tw.DateHelper.getShortDateNoDot(nextDate_2)
      };
      data.monthCode = { 'M0012': '12', 'M0024': '24' };
      $.extend(this._confirmOptions, data);
    }
    this._convConfirmOptions();
    this._bindEvent();
  },

  _bindEvent: function () {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._getJoinConfirmContext, this));
  },

  _getJoinConfirmContext: function () {
    $.get(Tw.Environment.cdn + '/hbs/product_common_confirm.hbs', $.proxy(this._setConfirmBodyIntoContainer, this));
  },

  _setConfirmBodyIntoContainer: function (context) {
    var tmpl = Handlebars.compile(context),
        html = tmpl(this._confirmOptions);

    this.$container.html(html);
    this._callConfirmCommonJs();
  },

  _convConfirmOptions: function () {
    this._confirmOptions = $.extend(this._confirmOptions, {
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0),
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1
    });
  },

  _callConfirmCommonJs: function () {
    var options = $.extend(this._confirmOptions, {
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.DISCOUNT_PROGRAM,
      isSelectedProgram: true,
      isContractPlan: this._confirmOptions.isContractPlan,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      setInfo: 'set-info',
      isTerm: true,
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A2,
      isNoticeList: true,
      isMobilePlan: false,
      isDiscountPgm: true
    });

    if ( this._selType ) {
      options.settingSummaryTexts = [
        {
          spanClass: 'term',
          text: this._confirmOptions.monthCode[this._selType] + Tw.DATE_UNIT.MONTH
        },
        {
          spanClass: 'date',
          text: this._confirmOptions.monthDetail[this._selType]
        }];
    }
    new Tw.ProductCommonConfirm(true, this.$container, options, $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0063, {
      svcAgrmtPrdCd: this._selType
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this));
  },

  _procJoinRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    $.when(this._popupService.close())
      .then($.proxy(this._openSuccessPop, this));
  },

  _openSuccessPop: function () {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        mytPage: 'additions',
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo ?
          this._confirmOptions.preinfo.reqProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function ($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
  },

  _closePop: function () {
    this._popupService.close();
  },

  _onClosePop: function () {
    if ( this._selType ) {
      this._historyService.go(-2);
    }
    else {
      this._historyService.goBack();
    }
  }

};

