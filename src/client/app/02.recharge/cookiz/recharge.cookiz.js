/**
 * FileName: recharge.cookiz.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeCookiz = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeCookiz.prototype = {
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0028, {}).done(function (res) {
      if ( res.code === '00' ) {
        $('.prodName').text(res.result.prodName);
      }
    });
    this.$wrap_tpl_contact.html(this.tpl_contact({ isMobile: Tw.BrowserHelper.isMobile() }));
  },

  _cachedElement: function () {
    this.$wrap_tpl_contact = $('.wrap_tpl_contact');
    this.tpl_contact = Handlebars.compile($('#tpl_contact').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '.btn_go_history', $.proxy(this._goHistory, this));
    this.$container.on('click', '.btn_go_cookiz_process', $.proxy(this._goCookizProcess, this));
    this.$container.on('click', '.btn_cancel_autoRefill', $.proxy(this._cancelAutoRefill, this));
    this.$container.on('click', '#btn_cookiz_request', $.proxy(this._goCookizRequestProcess, this));
  },

  _cancelAutoRefill: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.COOKIZ_A01, null, null, $.proxy(this._onCancelAutoRefill, this));
  },

  _onCancelAutoRefill: function () {
  },

  _goCookizRequestProcess: function () {
    this._go('#request-step1');
  },

  _goCookizProcess: function () {
    this._go('#step1');
  },

  _goHistory: function () {
    this._goLoad('/recharge/cookiz/history');
  },

  _goLoad: function (url) {
    location.href = url;
  },

  _go: function (hash) {
    window.location.hash = hash;
  }
};
