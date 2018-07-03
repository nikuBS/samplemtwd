/**
 * FileName: home.main.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.22
 */

Tw.HomeMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._popupService = new Tw.PopupService();

  this._init();
  this._bindEvent();
};


Tw.HomeMain.prototype = {
  _init: function () {
    this.tplGiftCard = Handlebars.compile($('.gift-template').html());
    this.$giftCard = this.$container.find('#gift-card');
  },
  _bindEvent: function () {
    this.$container.on('click', '#refill-product', $.proxy(this._openRefillProduct, this));
    this.$container.on('click', '#gift-product', $.proxy(this._openGiftProduct, this));
    this.$container.on('click', '#gift-balance', $.proxy(this._getGiftBalance, this));
  },


  // 리필하기
  _openRefillProduct: function ($event) {
    this._popupService.openRefillProduct();
  },

  // 선물하기
  _openGiftProduct: function ($event) {
    this._popupService.openGiftProduct();
  },

  _getGiftBalance: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0014, {})
      .done($.proxy(this._successGiftBalance, this))
      .fail($.proxy(this._failGiftBalance, this));
  },

  _successGiftBalance: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      resp.result.showDataMb = Tw.FormatHelper.addComma(resp.result.dataRemQty);
      resp.result.showDataGb = Tw.FormatHelper.customDataFormat(resp.result.dataRemQty, 'MB', 'GB').data;
      this.$giftCard.html(this.tplGiftCard(resp.result));
    }

  },

  _failGiftBalance: function (error) {
    console.log(resp);
  }
};