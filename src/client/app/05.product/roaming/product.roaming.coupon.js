/**
 * FileName: product.roaming.coupon.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.09
 */

Tw.ProductRoamingCoupon = function(rootEl, bpcpServiceId) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(this.$container, '/product/roaming/coupon');
  this._tidLanding = new Tw.TidLandingComponent();
  this._bpcpServiceId = bpcpServiceId;
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
    // 로그인 하지 않은 상태에서 BPCP 페이지 호출 후 로그인 할 경우 BPCP 팝업이 뜨도록 설정
    if (!Tw.FormatHelper.isEmpty(this._bpcpServiceId)) {
      this._initBpcp();
    }
  },

  /**
   * BPCP 페이지 이동
   * @param state
   * @param event
   * @private
   */
  _onViewclicked: function (state, event) {
    if(state === 'COUPON'){
      state = event.currentTarget.id;
    }

    var url = Tw.OUTLINK.ROAMING_COUPON[state]; // 정의된 BPCP ID 가져오기

    this._title = state === 'REGISTER' ? 'REGISTER' : 'BUY';
    this._bpcpService.open(url, null, null);

    // 로그인 후 redirect 될 때 _initBpcp 함수로 bpcpServiceId 전달되도록 ts에서 처리됨
    history.replaceState(null, document.title, location.origin + '/product/roaming/coupon?bpcpServiceId=' + url);
  },

  _initBpcp: function() {
    this._bpcpService.open(this._bpcpServiceId);
    history.replaceState(null, document.title, location.origin + '/product/roaming/coupon');
  }

};
