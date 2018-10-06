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

  this._smartCardOrder = JSON.parse(smartCard);

  this.$elBarcode = null;
  this.$elArrSmartCard = [];
  this.loadingStaus = [];

  this._cachedElement();
  this._bindEvent();

  this._initScroll();
};

Tw.MainHome.prototype = {
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

    // var tmpl = Handlebars.compile($('#fe-band-data-share-li-detail').html());
    // var html = tmpl( resp.result );
    //
    // $btnContainer.html(html);
  },
  _getBillData: function (element) {
    this._apiService.request(Tw.API_CMD.BFF_05_0036, {})
      .done($.proxy(this._successBillData, this, element))
      .fail($.proxy(this._failBillData, this));
  },
  _successBillData: function (element, resp) {

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
  _getGiftData: function (element) {
    this._apiService.requestArray([
      { command: Tw.API_CMD.BFF_06_0015, params: {} },
      { command: Tw.API_CMD.BFF_06_0014, params: {} }
    ]).done($.proxy(this._successGiftData, this, element))
      .fail($.proxy(this._failGiftData, this));
  },
  _successGiftData: function (element, resp) {
    console.log(element, resp);
  },
  _failGiftData: function () {

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
        this._getGiftData(this.$elArrSmartCard[index]);
        break;
      case Tw.HOME_SMART_CARD_E.RECHARGE:
        this._getRechargeData(this.$elArrSmartCard[index]);
        break;
      default:
        Tw.Logger.warn('Not Support');
    }
  }

};