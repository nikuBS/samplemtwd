/**
 * @file myt-data.gift.available.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.17
 */

Tw.MyTDataGiftAvailable = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGiftAvailable.prototype = {
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0066, { type: 'G', giftBefPsblYn: 'Y' })
      .done($.proxy(this._onSuccessAvailableProduct, this));
  },

  _cachedElement: function () {
    this.wrap_available_product = this.$container.find('.fe-layer_available_product');
    this.tpl_available_product = Handlebars.compile($('#tpl-available-product').html());
  },

  _bindEvent: function () {
  },

  _onSuccessAvailableProduct: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var sortedList = Tw.FormatHelper.purifyPlansData(res.result);

      this.wrap_available_product.html(
        this.tpl_available_product({ sortedList: sortedList })
      );
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};