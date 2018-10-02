/**
 * FileName: product.additions-terminate.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

Tw.ProductAdditionsTerminate = function(rootEl) {
  this.$container = rootEl;
  this._prodId = this.$container.data('prod_id');
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductAdditionsTerminate.prototype = {

  _cachedElement: function() {
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$btnClose = this.$container.find('.fe-btn_close');
  },

  _bindEvent: function() {
    this.$btnTerminate.on('click', $.proxy(this._openConfirmPopup, this));
    this.$btnClose.on('click', $.proxy(this._close, this));
  },

  _openConfirmPopup: function() {
    this._popupService.openModalTypeA(null, Tw.PRODUCT_ADDITIONS_TERMINATE.CONFIRM_POPUP,
      Tw.PRODUCT_ADDITIONS_TERMINATE.CONFIRM_BUTTON, null, $.proxy(this._procTerminate, this));
  },

  _procTerminate: function() {
    // @todo 해지 클릭시 인증 Step 추가 해야함.
    this._apiService.request(Tw.API_CMD.BFF_10_0022, {}, {}, this._prodId).done($.proxy(this._goSuccessPage, this));
  },

  _goSuccessPage: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).page();
    }

    this._historyService.replaceURL('/product/additions-terminate/' + this._prodId + '/success');
  },

  _close: function() {
    this._historyService.goBack();
  }

};
