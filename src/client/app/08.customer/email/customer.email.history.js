/**
 * FileName: customer.email.history.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.01
 */

Tw.CustomerEmailHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._bindEvent();
  this._init();
};

Tw.CustomerEmailHistory.prototype = {
  _init: function () {
    this._hideListItem();
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn_history_detail', $.proxy(this._goToHistoryDetail, this));
    this.$container.on('click', '.fe-history-more', $.proxy(this._onShowMoreList, this));
  },

  _goToHistoryDetail: function (e) {
    this._history.goLoad('/customer/emailconsult/history-detail?' + $.param($(e.currentTarget).data()));
  },

  _onShowMoreList: function (e) {
    var elTarget = e.currentTarget;
    var $hideListItem = $('.email-consult-list li').not(':visible');

    if ( $hideListItem.size() !== 0 ) {
      $hideListItem.slice(0, 20).show();
    }

    if ( $hideListItem.size() === 0 ) {
      elTarget.remove();
    }
  },

  _hideListItem: function () {
    $('.email-consult-list li').slice(20).hide();
  }
};