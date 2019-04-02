/**
 * FileName: benefit.dis-pgm.cancel.js
 * Author: Kim In Hwan (skt.P132150@partner.sk.com)
 * Date: 2018.12.18
 */

Tw.BenefitDisPgmCancel = function(rootEl, prodId, confirmOptions) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));

  this._init();
  this._convConfirmOptions();
  this._bindEvent();
};

Tw.BenefitDisPgmCancel.prototype = {

  _init: function() {
    // NA00002079 (2년이상), NA00002082(3년이상), NA00002080(5년이상), NA00002081(10년이상), NA00002246(2년미만)
    switch ( this._prodId ) {
      // T Plus 요금제
      case 'NA00002079':
      case 'NA00002082':
      case 'NA00002080':
      case 'NA00002081':
      case 'NA00002246':
        this._isTPlus = true;
        break;
    }
  },

  _bindEvent: function() {
    // window 'env' 이벤트 발생시 페이지를 팝업으로 호출 - 상품 쪽과 동일
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
      title: Tw.PRODUCT_TYPE_NM.TERMINATE,
      applyBtnText: Tw.BUTTON_LABEL.TERMINATE,
      isMobilePlan: false,
      joinTypeText: Tw.PRODUCT_TYPE_NM.TERMINATE,
      typeText: Tw.PRODUCT_CTG_NM.DISCOUNT_PROGRAM,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.isTermStplAgree,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1
    });
  },

  _callConfirmCommonJs: function() {
    new Tw.ProductCommonConfirm(
      false,
      this.$container,
      {
        confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A4,
        noticeList: this._confirmOptions.prodNoticeList,
        isWidgetInit: true,
        isTerm: true
      },
      $.proxy(this._prodConfirmOk, this)
    );
  },

  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    if(this._isTPlus) {
      this._apiService.request(Tw.API_CMD.BFF_10_0083, {}, {}, [this._prodId]).done($.proxy(this._procTerminateRes, this))
        .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
    }
    else {
      this._apiService.request(Tw.API_CMD.BFF_10_0036, {}, {}, [this._prodId]).done($.proxy(this._procTerminateRes, this))
        .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
    }
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
          prodCtgNm: Tw.PRODUCT_CTG_NM.DISCOUNT_PROGRAM,
          typeNm: Tw.PRODUCT_TYPE_NM.TERMINATE,
          isBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
          basFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo ?
            this._confirmOptions.preinfo.reqProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
        }
      },
      $.proxy(this._openResPopupEvent, this),
       null,
      'terminate_success'
    );
  },

  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.btn-floating.tw-popup-closeBtn', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function (e) {
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
    this._historyService.replaceURL('/product/callplan?prod_id='+this._prodId);
    this._popupService.closeAllAndGo('/product/callplan?prod_id='+this._prodId);
  }
};