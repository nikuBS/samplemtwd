/**
 * 상품 가입 - 유선 부가서비스
 * FileName: product.wireplan.join.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

Tw.ProductWireplanJoin = function(rootEl, prodId, confirmOptions, btnData) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._confirmOptions = JSON.parse(unescape(confirmOptions));
  this._btnData = JSON.parse(unescape(btnData));

  this._init();
};

Tw.ProductWireplanJoin.prototype = {

  _init: function() {
    this._convConfirmOptions();
    this._bindEvent();
  },

  _bindEvent: function() {
    $(window).on('env', $.proxy(this._getJoinConfirmContext, this));
  },

  _getJoinConfirmContext: function() {
    $.get(Tw.Environment.cdn + '/hbs/product_wireplan_confirm.hbs', $.proxy(this._setConfirmBodyIntoContainer, this));
  },

  _setConfirmBodyIntoContainer: function(context) {
    var tmpl = Handlebars.compile(context),
      html = tmpl(this._confirmOptions);

    this.$container.html(html);
    this._callConfirmCommonJs();
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      isTerm: false,
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: this._confirmOptions.preinfo.svcNumMask,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0)
    });
  },

  _callConfirmCommonJs: function() {
    new Tw.ProductCommonConfirm(false, this.$container, {
      isWireplan: true,
      noticeList: this._confirmOptions.noticeList,
      isWidgetInit: true,
      isJoin: true
    }, $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0099, {
      addInfoExistYn: this._btnData.addInfoExistYn,
      addInfoRelScrnId: this._btnData.addInfoRelScrnId,
      addSvcAddYn: this._btnData.addSvcAddYn,
      cntcPlcInfoRgstYn: this._btnData.cntcPlcInfoRgstYn,
      svcProdGrpCd: this._btnData.svcProdGrpCd
    }, {}, this._prodId).done($.proxy(this._procJoinRes, this));
  },

  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

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
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        mytPage: 'additions',
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

