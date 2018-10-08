/**
 * FileName: main.home.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.06

 */

Tw.MainHome = function (rootEl, smartCard) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeSrevice = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._smartCardOrder = JSON.parse(smartCard);

  this.$elBarcode = null;
  this.$elArrSmartCard = [];
  this.loadingStaus = [];

  this._cachedElement();
  this._bindEvent();

  this._initScroll();
};

Tw.MainHome.prototype = {
  GIFT_ERROR_CODE: {
    GFT0001: 'GFT0001',   // 제공자 선물하기 불가 상태
    GFT0002: 'GFT0002',   // 제공자 선물하기 불가 요금제
    GFT0003: 'GFT0003',   // 제공자 당월 선물가능 횟수 초과
    GFT0004: 'GFT0004',   // 제공자 당월 선물가능 용량 미달
    GFT0005: 'GFT0005',   // 제공자가 미성년자이면 선물하기 불가
    GFT0013: 'GFT0013'    // 기
  },


  _cachedElement: function () {
    this.$elBarcode = this.$container.find('#fe-membership-barcode');
    this.$elBarcode.JsBarcode(this.$elBarcode.data('cardnum'));

    this._cachedSmartCard();
    this._cachedSmartCardTemplate();
  },
  _bindEvent: function () {
    this.$elBarcode.on('click', $.proxy(this._onClickBarcode, this));

  },
  _onClickBarcode: function () {
  },
  _cachedSmartCard: function () {
    for ( var i = 0; i < 16; i++ ) {
      var $card = this.$container.find('.fe-smart-' + i);
      if ( $card.length > 0 ) {
        this.$elArrSmartCard.push($card);
        this.loadingStaus.push(false);
      }
    }
  },
  _cachedSmartCardTemplate: function () {

  },
  _getBillData: function (element) {
    this._apiService.requestArray([
      { command: Tw.API_CMD.BFF_05_0036, params: {} },
      { command: Tw.API_CMD.BFF_05_0047, params: {} }
    ]).done($.proxy(this._successBillData, this, element))
      .fail($.proxy(this._failBillData, this));
  },
  _successBillData: function (element, resp1, resp2) {
  },
  _failBillData: function () {

  },
  _getContentData: function (element) {
    this._apiService.request(Tw.API_CMD.BFF_05_0064, {})
      .done($.proxy(this._successContentData, this, element))
      .fail($.proxy(this._failContentData, this));
  },
  _successContentData: function (element, resp) {

  },
  _failContentData: function () {

  },
  _getMicroPayData: function (element) {
    this._apiService.request(Tw.API_CMD.BFF_05_0079, {})
      .done($.proxy(this._successMicroPayData, this, element))
      .fail($.proxy(this._failMicroPayData, this));
  },
  _successMicroPayData: function (element, resp) {

  },
  _failMicroPayData: function () {

  },
  _getGiftData: function (element, index) {
    // skt_landing.action.loading.on({ ta: '.fe-smart-' + index, co: 'grey', size: true });
    this._apiService.requestArray([
      { command: Tw.API_CMD.BFF_06_0015, params: {} },
      { command: Tw.API_CMD.BFF_06_0014, params: { reqCnt: Tw.GIFT_REMAIN_RETRY } }
    ]).done($.proxy(this._successGiftData, this, element))
      .fail($.proxy(this._failGiftData, this));
  },
  _successGiftData: function (element, sender, remain) {
    var $giftTemp = $('#fe-smart-gift');
    this.tplGiftCard = Handlebars.compile($giftTemp.html());
    element.html(this.tplGiftCard(this._parseGiftData(sender, remain)));

    $('.fe-bt-go-gift').click($.proxy(this._onClickBtGift, this, sender));
  },
  _failGiftData: function () {

  },
  _parseGiftData: function (sender, remain) {
    var result = {
      blockUsage: false,
      blockProduct: false,
      enableGiftBt: true
    };

    if ( new Date().getDate() === Tw.GIFT_BLOCK_USAGE ) {
      result.blockUsage = true;
      return result;
    }
    this._parseSenderData(sender, remain, result);

    return result;
  },

  _parseSenderData: function (sender, remain, result) {
    if ( sender.code === Tw.API_CODE.CODE_00 ) {
      this._parseRemainData(remain, result);
      result.dataGiftCnt = sender.result.dataGiftCnt;
      result.familyDataGiftCnt = sender.result.familyDataGiftCnt;
      result.familyMemberYn = sender.result.familyMemberYn === 'Y';
      result.goodFamilyMemberYn = sender.result.goodFamilyMemberYn === 'Y';
      result.enableGiftBt = !(sender.result.dataGiftCnt === '0' && sender.result.familyDataGiftCnt === '0');
    } else if ( sender.code === this.GIFT_ERROR_CODE.GFT0002 ) {
      result.blockProduct = true;
    } else {
      Tw.Error(sender.code, sender.msg).pop();
    }
  },
  _parseRemainData: function (remain, result) {
    if ( remain.code === Tw.API_CODE.CODE_00 ) {
      result.dataRemQty = remain.result.dataRemQty;
    } else {
      result.dataRemQty = '32.2';
      // Tw.Error(remain.code, remain.msg).pop();
    }
  },
  _onClickBtGift: function (sender) {
    if ( sender.code === Tw.API_CODE.CODE_00 ) {
      if ( sender.result.dataGiftCnt > 0 ) {
        this._historyService.goLoad('/myt/data/gift');
      } else if (sender.result.familyDataGiftCnt > 0) {
        this._historyService.goLoad('/myt/data/gift#auto');
      }
    }

  },
  _getRechargeData: function (element) {

  },
  _successRechargeData: function (element, resp) {

  },
  _failRrchargeData: function () {

  },

  _elementScrolled: function (element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = element.offset().top;
    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
  },
  _initScroll: function () {
    this._checkScroll();
    $(window).scroll($.proxy(function () {
      this._checkScroll();
    }, this));
  },
  _checkScroll: function () {
    _.map(this.$elArrSmartCard, $.proxy(function (card, index) {
      if ( this._elementScrolled(card) ) {
        this._initSmartCard(index);
      }
    }, this));
  },
  _initSmartCard: function (index) {
    this._getSmartCard(index);
    this._getSmartCard(index + 1);
    this._getSmartCard(index + 2);
  },
  _getSmartCard: function (index) {
    if ( index < this.loadingStaus.length && !this.loadingStaus[index] ) {
      var cardNo = this.$elArrSmartCard[index].data('smartcard');
      this._drawSmartCard(cardNo, index);
      this.loadingStaus[index] = true;
    }
  },
  _drawSmartCard: function (cardNo, index) {
    switch ( cardNo ) {
      case Tw.HOME_SMART_CARD_E.BILL:
        this._getBillData(this.$elArrSmartCard[index]);
        break;
      case Tw.HOME_SMART_CARD_E.CONTENT:
        this._getContentData(this.$elArrSmartCard[index]);
        break;
      case Tw.HOME_SMART_CARD_E.MICRO_PAY:
        this._getMicroPayData(this.$elArrSmartCard[index]);
        break;
      case Tw.HOME_SMART_CARD_E.GIFT:
        this._getGiftData(this.$elArrSmartCard[index], index);
        break;
      case Tw.HOME_SMART_CARD_E.RECHARGE:
        this._getRechargeData(this.$elArrSmartCard[index]);
        break;
      default:
        Tw.Logger.warn('Not Support');
    }
  }

};