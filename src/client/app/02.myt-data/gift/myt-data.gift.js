/**
 * FileName: myt-data.gift.js
 * Author: Hakjoon Sim (hakjoon.simk@sk.com)
 * Date: 2018.10.08
 */

Tw.MyTDataGift = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._init();
};

Tw.MyTDataGift.prototype = {
  _init: function () {
    // If there is hash #auto, show second tab(auto gift)
    if ( window.location.hash === '#auto' ) {
      this._goAutoGiftTab();
    }

    this.$container.on('click', '.fe-available_product', $.proxy(this._onClickShowAvailableProduct, this));
    this.$container.on('click', '.fe-close-available_product', $.proxy(this._onHideAvailableProduct, this));
    this.$container.on('click', '.fe-show-more-amount', $.proxy(this._onShowMoreData, this));
  },
  _goAutoGiftTab: function () {
    var $tab1 = this.$container.find('#tab1');
    var $tab2 = this.$container.find('#tab2');
    $tab1.attr('aria-selected', false);
    $tab2.attr('aria-selected', true);
  },

  _onShowMoreData: function (e) {
    var $btn_show_data = $(e.currentTarget);

    $btn_show_data.closest('.data-gift-wrap').find('li').show();
    $btn_show_data.remove();
  },

  _onClickShowAvailableProduct: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0066, {}).done($.proxy(this._onSuccessAvailableProduct, this));
  },

  _onSuccessAvailableProduct: function (res) {
    $('.fe-layer_available_product').show();
    // if ( res.code === Tw.API_CODE.CODE_00 ) {
    //   debugger;
    // } else {
    //   Tw.Error(res.code, res.msg).pop();
    // }
  },

  _onHideAvailableProduct: function () {
    $('.fe-layer_available_product').hide();
  }
};
