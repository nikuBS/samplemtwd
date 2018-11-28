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
    this.wrap_tpl_available_product = $('.fe-layer_available_product');
    this.tpl_available_product = Handlebars.compile($('#tpl-available-product').html());

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
    this._apiService.request(Tw.API_CMD.BFF_06_0066, {
      type: 'G',
      giftBefPsblYn: 'Y'
    }).done($.proxy(this._onSuccessAvailableProduct, this));
  },

  _onSuccessAvailableProduct: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var sortedList = this._purifyPlansData(res.result);

      this.wrap_tpl_available_product.html(this.tpl_available_product({sortedList:sortedList}));
      this.wrap_tpl_available_product.show();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onHideAvailableProduct: function () {
    this.wrap_tpl_available_product.hide();
  },

  _purifyPlansData: function (rawData) {
    var data = rawData.sort(function (a, b) {
      var ia = a.initial;
      var ib = b.initial;

      var patternHangul = /[ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ]/;

      var order = function (a, b) {
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        }
        return 0;
      };

      if (ia.match(patternHangul) && ib.match(patternHangul)) {
        return order(ia, ib);
      }

      if (ia.match(/[a-zA-Z]/) && ib.match(/[a-zA-Z]/)) {
        return order(ia, ib);
      }

      if (ia.match(/[0-9]/) && ib.match(/[0-9]i/)) {
        return order(ia, ib);
      }

      if (ia < ib) {
        return 1;
      } else if (ia > ib) {
        return -1;
      }
      return 0;
    });

    return data;
  }
};
