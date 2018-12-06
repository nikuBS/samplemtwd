/**
 * FileName: product.roaming.coupon.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.09
 */

Tw.ProductRoamingCoupon = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._bindEvent();
};

Tw.ProductRoamingCoupon.prototype = {

  _bindEvent: function() {
    this.$container.on('click', '#coupon-buy-btn', $.proxy(this._onViewclicked, this, 'buy'));
    this.$container.on('click', '#coupon-register-btn', $.proxy(this._onViewclicked, this, 'register'));
    this.$container.on('click', '#coupon-inquire-btn', $.proxy(this._onViewclicked, this, 'inquire'));
  },

  _onViewclicked: function (hash) {
    var hbs = '';

    if( hash === 'buy'){
      hbs = 'RM_13_01';
    }else if(hash === 'register'){
      hbs = 'RM_13_02';
    }else if(hash === 'inquire'){
      hbs = 'RM_13_03';
    }

    this._popupService.open({
        hbs: hbs,
        layer: true
      },
      null,
      null, hash);
  }
};
