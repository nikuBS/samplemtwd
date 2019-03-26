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
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(this.$container, '/product/roaming/coupon');
  this._tidLanding = new Tw.TidLandingComponent();
  this._bindEvent();
  this._init();
};

Tw.ProductRoamingCoupon.prototype = {

  _bindEvent: function() {
    this.$container.on('click', '#coupon-buy-btn', $.proxy(this._onViewclicked, this, 'BUY'));
    this.$container.on('click', '#coupon-register-btn', $.proxy(this._onViewclicked, this, 'REGISTER'));
    this.$container.on('click', '#coupon-inquire-btn', $.proxy(this._onViewclicked, this, 'INQUIRE'));
    this.$container.on('click', '.card-coupon-inner', $.proxy(this._onViewclicked, this, 'COUPON'));
  },

  _init: function(){
    history.replaceState(null, document.title, location.origin + '/product/roaming/coupon');
  },

  _onViewclicked: function (state, event) {
    if(state === 'COUPON'){
      state = event.currentTarget.id;
    }

    var url = Tw.OUTLINK.ROAMING_COUPON[state];

    this._title = state === 'REGISTER' ? 'REGISTER' : 'BUY';
    this._bpcpService.open(url, null, null, event);
  }

};
