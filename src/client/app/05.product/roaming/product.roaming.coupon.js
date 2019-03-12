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

    $(window).on('message', $.proxy(this._getWindowMessage, this));
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

    this._getBPCP(url);
  },

  _getBPCP: function(url) {
    var replaceUrl = url.replace('BPCP:', '');
    this._apiService.request(Tw.API_CMD.BFF_01_0039, { bpcpServiceId: replaceUrl })
      .done($.proxy(this._responseBPCP, this))
      .fail($.proxy(this._onFail, this));
  },

  _responseBPCP: function(resp) {
    if (resp.code === 'BFF0003') {
      return this._tidLanding.goLogin(location.origin + '/product/roaming/coupon');
    }

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var url = resp.result.svcUrl;
    if (Tw.FormatHelper.isEmpty(url)) {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.BPCP).pop();
    }

    if (!Tw.FormatHelper.isEmpty(resp.result.tParam)) {
      url += (url.indexOf('?') !== -1 ? '&tParam=' : '?tParam=') + resp.result.tParam;
    }

    url += '&ref_origin=' + encodeURIComponent(location.origin);

    this._popupService.open({
      hbs: 'product_bpcp',
      iframeUrl: url
    }, null, $.proxy(function() {
      this._historyService.replaceURL('/product/roaming/coupon');
    }, this));
  },

  _getWindowMessage: function(e) {
    var data = e.data || e.originalEvent.data;

    // BPCP 팝업 닫기
    if (data === 'popup_close') {
      this._popupService.close();
    }

    // BPCP 팝업 닫고 링크 이동
    if (data.indexOf('goLink:') !== -1) {
      this._popupService.closeAllAndGo(data.replace('goLink:', ''));
    }

    // BPCP 팝업 닫고 로그인 호출
    if (data.indexOf('goLogin:') !== -1) {
      this._tidLanding.goLogin(location.origin + '/product/roaming/coupon&' + $.param(JSON.parse(data.replace('goLogin:', ''))));
    }
  },

  _onFail: function(err) {
    Tw.Error(err.code,err.msg).pop();
  }
};
