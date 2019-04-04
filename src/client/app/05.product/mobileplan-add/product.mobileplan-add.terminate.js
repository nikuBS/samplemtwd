/**
 * @file product.mobileplan-add.terminate.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.13
 */

Tw.ProductMobileplanAddTerminate = function(rootEl, prodId, confirmOptions) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));

  this._convConfirmOptions();
  this._bindEvent();
};

Tw.ProductMobileplanAddTerminate.prototype = {

  _bindEvent: function() {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._getJoinConfirmContext, this));
  },

  _getJoinConfirmContext: function() {
    $.get(Tw.Environment.cdn + '/hbs/product_common_confirm.hbs', $.proxy(this._setConfirmBodyIntoContainer, this));
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
      title: Tw.PRODUCT_TYPE_NM.TERMINATE,
      applyBtnText: Tw.BUTTON_LABEL.TERMINATE,
      isMobilePlan: false,
      joinTypeText: Tw.PRODUCT_TYPE_NM.TERMINATE,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      noticeList: this._confirmOptions.preinfo.termNoticeList,
      isNoticeList: this._confirmOptions.preinfo.termNoticeList && this._confirmOptions.preinfo.termNoticeList.length > 0,
      isAgreement: this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.isTermStplAgree,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1
    });
  },

  _callConfirmCommonJs: function() {
    new Tw.ProductCommonConfirm(
      false,
      this.$container,
      {
        isTerm: true,
        confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A4,
        isWidgetInit: true
      },
      $.proxy(this._prodConfirmOk, this)
    );
  },

  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0036, {}, {}, [this._prodId])
      .done($.proxy(this._procTerminateRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _procTerminateRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0038, {}, {}, [this._prodId]).done($.proxy(this._isVasTerm, this));
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

    this._popupService.open(
      {
        hbs: 'complete_product',
        data: {
          btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
          btClass: 'item-one',
          prodId: this._prodId,
          prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
          prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
          typeNm: Tw.PRODUCT_TYPE_NM.TERMINATE,
          isBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
          basFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo ?
            this._confirmOptions.preinfo.reqProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
        }
      },
      $.proxy(this._openResPopupEvent, this),
      $.proxy(this._onClosePop, this),
      'terminate_success'
    );
  },

  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
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

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }
};
