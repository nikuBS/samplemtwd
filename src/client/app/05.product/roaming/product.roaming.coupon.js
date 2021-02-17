/**
 * @file product.roaming.coupon.js
 * @desc T로밍 > 카드/쿠폰
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.11.09
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
    // 모두 BPCP id를 이용하여 BP 페이지로 이동, BPCP 구매내역 확인하여 로직 처리 불가(BE 이지민 수석님 답변)
    this.$container.on('click', '#coupon-buy-btn', $.proxy(this._onViewclicked, this, 'BUY')); // 구매하기
    this.$container.on('click', '#coupon-register-btn', $.proxy(this._onViewclicked, this, 'REGISTER')); // 등록하기
    this.$container.on('click', '#coupon-inquire-btn', $.proxy(this._onViewclicked, this, 'INQUIRE')); // 구매내역 조회
    this.$container.on('click', '.card-coupon-inner', $.proxy(this._onViewclicked, this, 'COUPON')); // T로밍 카드 쿠폰 소개
  },

  _init: function(){
    // 로그인 하지 않은 상태에서 BPCP 페이지 호출 후 로그인 할 경우 BPCP 팝업이 뜨도록 설정
    if (!Tw.FormatHelper.isEmpty(this._bpcpServiceId)) {
      this._initBpcp();
    }
  },

  /**
   * @function
   * @desc BPCP 페이지 이동
   * @param state - 선택된 영역 Flag
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
  },

  /**
   * @function
   * @desc bpcpServiceId 가 있는 경우 BPCP 팝업을 오픈
   * @private
   */
  _initBpcp: function() {
    this._bpcpService.open(this._bpcpServiceId);
    history.replaceState(null, document.title, location.origin + '/product/roaming/coupon');
  }

};
