/**
 * @file customer.email.history.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.11.01
 */

Tw.CustomerEmailHistory = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._bindEvent();
  this._init();  
};

Tw.CustomerEmailHistory.prototype = {
  _init: function () {
    this.nMaxListSize = 20;
    this._hideListItem();
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn_history_detail', $.proxy(this._goToHistoryDetail, this));
    this.$container.on('click', '.fe-history-more', $.proxy(this._onShowMoreList, this));
  },

  _goToHistoryDetail: function (e) {
    var $target = $(e.currentTarget);
    this._history.goLoad('/customer/emailconsult/history-detail?' + $.param($target.data()));
  },

  _onShowMoreList: function (e) {
    var elTarget = $(e.currentTarget);
    var $hideListItem = $('.email-consult-list li').not(':visible');

    if ( $hideListItem.size() !== 0 ) {
      $hideListItem.slice(0, this.nMaxListSize).show();
    }

    if ( $hideListItem.size() <= this.nMaxListSize ) {
      elTarget.remove();
    }
  },

  _hideListItem: function () {
    $('.email-consult-list li').slice(this.nMaxListSize).hide();
  }
};