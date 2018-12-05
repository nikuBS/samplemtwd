/**
 * FileName: product.mobileplan-add.terminate.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

Tw.ProductMobileplanAddTerminate = function(rootEl, prodId, confirmOptions) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._confirmOptions = JSON.parse(confirmOptions);

  this._init();
};

Tw.ProductMobileplanAddTerminate.prototype = {

  _init: function() {
    this._convConfirmOptions();
    this._bindEvent();
  },

  _bindEvent: function() {
    $(window).on('env', $.proxy(this._getJoinConfirmContext, this));
  },

  _setConfirmBodyIntoContainer: function(context) {
    var tmpl = Handlebars.compile(context),
      html = tmpl(this._confirmOptions);

    this.$container.html(html);
    this._callConfirmCommonJs();
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      title: Tw.PRODUCT_TYPE_NM.TERMINATE,
      applyBtnText: Tw.BUTTON_LABEL.TERMINATE,
      isMobilePlan: false,
      joinTypeText: Tw.PRODUCT_TYPE_NM.TERMINATE,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: this._confirmOptions.preinfo.svcNumMask,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAutoJoinTermList: (this._confirmOptions.preinfo.autoJoinList.length > 0 || this._confirmOptions.preinfo.autoTermList.length > 0),
      isAgreement: this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.isTermStplAgree
    });
  },

  _callConfirmCommonJs: function() {
    new Tw.ProductCommonConfirm(false, this.$container, {
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A4,
      noticeList: this._confirmOptions.prodNoticeList,
      isWidgetInit: true
    }, $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    // prodId: this._prodId,
    //   prodProcTypeCd: 'TM'

    this._apiService.request(Tw.API_CMD.BFF_10_0036, {
    }, {}, this._prodId).done($.proxy(this._procTerminateRes, this));
  },

  _procTerminateRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0038, {}, {}, this._prodId)
      .done($.proxy(this._isVasTerm, this));
  },

  _isVasTerm: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openVasTermPopup(resp.result);
  },

  _openSuccessPop: function() {
    if ( !this._isResultPop ) {
      return;
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        mytPage: 'myplanadd',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        typeNm: Tw.PRODUCT_TYPE_NM.TERMINATE,
        isBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo ?
          this._confirmOptions.preinfo.reqProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._openResPopupEvent, this), $.proxy(this._onClosePop, this), 'terminate_success');
  },

  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
  },

  _openVasTermPopup: function(respResult) {
    var popupOptions = {
      hbs:'MV_01_02_02_01',
      'bt': [{
        style_class: 'bt-blue1 fe-btn_back',
        txt: Tw.BUTTON_LABEL.CLOSE
      }]
    };

    if (respResult.prodTmsgTypCd === 'H') {
      popupOptions = $.extend(popupOptions, {
        editor_html: respResult.prodTmsgHtmlCtt
      });
    }

    if (respResult.prodTmsgTypCd === 'I') {
      popupOptions = $.extend(popupOptions, {
        img_url: Tw.FormatHelper.isEmpty(respResult.rgstImgUrl) ? null : respResult.rgstImgUrl,
        img_src: respResult.imgFilePathNm
      });
    }

    this._isResultPop = true;
    this._popupService.open(popupOptions, $.proxy(this._bindVasTermPopupEvent, this),
      $.proxy(this._openSuccessPop, this), 'vasterm_pop');
  },

  _bindVasTermPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
  },

  _closeAndOpenResultPopup: function() {
    this._isResultPop = true;
    this._popupService.close();
  },

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
