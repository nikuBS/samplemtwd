/**
 * FileName: myt-data.gift.js
 * Author: Hakjoon Sim (hakjoon.simk@sk.com)
 * Date: 2018.10.08
 */

Tw.MyTDataGift = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGift.prototype = {
  _init: function () {
    // If there is hash #auto, show second tab(auto gift)
    if ( window.location.hash === '#auto' ) {
      this._goAutoGiftTab();
    }
  },

  _cachedElement: function () {
    this.$recent_tel = this.$container.find('.recently-tel');
    this.$inputImmediatelyGift = this.$container.find('.fe-input_immediately_gift');
    this.wrap_available_product = this.$container.find('.fe-layer_available_product');
    this.tpl_recently_gift = Handlebars.compile($('#tpl_recently_gift').html());
    this.tpl_available_product = Handlebars.compile($('#tpl-available-product').html());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-available_product', $.proxy(this._onClickShowAvailableProduct, this));
    this.$container.on('click', '.fe-close-available_product', $.proxy(this._hideAvailableProduct, this));
    this.$container.on('click', '.fe-show-more-amount', $.proxy(this._onShowMoreData, this));
    this.$inputImmediatelyGift.on('focus', $.proxy(this._onLoadRecently, this));
  },

  _onLoadRecently: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0018, {
      fromDt: Tw.DateHelper.getPastYearShortDate(),
      toDt: Tw.DateHelper.getCurrentShortDate(),
      giftType: 'G1'
    }).done($.proxy(this._onSuccessRecently, this));
  },

  _onSuccessRecently: function (res) {
    var tempAddr = [];

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var contactList = res.result;

      var list = contactList.filter(function (item) {
        if ( tempAddr.includes(item.svcNum) ) {
          return false;
        }
        tempAddr.push(item.svcNum);
        return true;
      });

      var filteredList = list.splice(0, 3).map(function (item) {
        return $.extend(item, { svcNum: Tw.FormatHelper.conTelFormatWithDash(item.svcNum) });
      });

      this.$recent_tel.html(this.tpl_recently_gift({ contactList: filteredList }));
      this.$recent_tel.show();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _hideRecently: function () {
    this.$recent_tel.hide();
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
    this._apiService.request(Tw.API_CMD.BFF_06_0066, { type: 'G', giftBefPsblYn: 'Y' })
      .done($.proxy(this._onSuccessAvailableProduct, this));
  },

  _onSuccessAvailableProduct: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var sortedList = Tw.FormatHelper.purifyPlansData(res.result);

      this.wrap_available_product.html(
        this.tpl_available_product({ sortedList: sortedList })
      );

      this._showAvailableProduct();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _showAvailableProduct: function () {
    this.wrap_available_product.show();
  },

  _hideAvailableProduct: function () {
    this.wrap_available_product.hide();
  }
};
