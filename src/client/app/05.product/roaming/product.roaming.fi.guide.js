/**
 * FileName: product.roaming.fi.guide.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.07
 */

Tw.ProductRoamingFiGuide = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductRoamingFiGuide.prototype = {

  _cachedElement: function() {
    this.$btnInquire = this.$container.find('#inquire-btn');
    this.$btnReservation = this.$container.find('#reservation-btn');
  },

  _bindEvent: function() {
    this.$btnInquire.on('click', $.proxy(this._goInquire, this));
    this.$btnReservation.on('click', $.proxy(this._goReservation, this));
  },

  _alarmApply: function() {
    this._apiService.request(Tw.API_CMD.BFF_05_0126, {})
      .done($.proxy(this._applyResult, this));
  },

  _applyResult: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A39.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A39.TITLE, null, $.proxy(this._reload, this));
  },

  _goReservation: function() {
    this._historyService.replaceURL('/product/roaming/fi/reservation1step');
  },

  _goInquire: function() {
    this._historyService.replaceURL('/product/roaming/fi/inquire');
  },

  _reload: function() {
    this._historyService.reload();
  }
};
