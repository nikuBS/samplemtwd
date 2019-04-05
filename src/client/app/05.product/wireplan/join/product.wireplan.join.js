/**
 * 상품 가입 - 유선 부가서비스
 * @file product.wireplan.join.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.01
 */

Tw.ProductWireplanJoin = function(rootEl, prodId, confirmOptions, btnData) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._btnData = JSON.parse(window.unescape(btnData));

  this._convConfirmOptions();
  this._bindEvent();
};

Tw.ProductWireplanJoin.prototype = {

  _bindEvent: function() {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._getJoinConfirmContext, this));
  },

  _getJoinConfirmContext: function() {
    $.get(Tw.Environment.cdn + '/hbs/product_wireplan_confirm.hbs', $.proxy(this._setConfirmBodyIntoContainer, this));
  },

  _setConfirmBodyIntoContainer: function(context) {
    var tmpl = Handlebars.compile(context),
      html = tmpl(this._confirmOptions);

    this.$container.html(html);
    this._callConfirmCommonJs();
    Tw.Tooltip.separateMultiInit(this.$container);
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      pageId: 'M000433',
      isTerm: false,
      isNoticeList: true,
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: this._confirmOptions.preinfo.reqProdInfo.svcCd === 'P' ?
        Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask) : this._confirmOptions.preinfo.svcNumMask,
      svcNickname: Tw.SVC_CD[this._confirmOptions.preinfo.reqProdInfo.svcCd],
      noticeList: this._confirmOptions.noticeList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0),
      iconClass: this._getIcon()
    });
  },

  _getIcon: function() {
    if (this._confirmOptions.preinfo.reqProdInfo.svcCd === 'P') {
      return 'ico-type2';
    }

    return 'ico-type1';
  },

  _callConfirmCommonJs: function() {
    new Tw.ProductCommonConfirm(false, this.$container, {
      isWireplan: true,
      isWidgetInit: true,
      isPcJoin: false
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
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
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
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
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

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};

