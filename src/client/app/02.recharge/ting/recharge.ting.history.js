/**
 * FileName: recharge.ting.history.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeTingHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeTingHistory.prototype = {
  _init: function () {
    /**
     * @param type : {A:all, R:receive, S:send}
     * @param fromDt : YYYYMMDD
     * @param endDt : YYYYMMDD
     */
    this._apiService.request(Tw.API_CMD.BFF_06_0026, {
      type: 'all',
      fromDt: Tw.DateHelper.getCurrentShortDate,
      endDt: Tw.DateHelper.getPastYearShortDate
    }).done($.proxy(function () {
      // TODO: Activate Block

    }, this))
      .fail($.proxy(this._sendFail, this));
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.select-submit', $.proxy(this.onConfirm, this))
  },

  onConfirm: function () {
  },

  _onSuccessGetProvider: function () {
  },

  _sendFail: function () {
  }
};