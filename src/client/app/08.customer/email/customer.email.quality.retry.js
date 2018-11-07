/**
 * FileName: customer.email.quality.retry.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.07
 */

Tw.CustomerEmailQualityRetry = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailQualityRetry.prototype = {
  _init: function () {

  },

  _cachedElement: function () {
    this.$btn_faq = this.$container.find('.fe-btn_faq');
  },

  _bindEvent: function () {
    this.$container.on('click', '.cancel', $.proxy(this._onKeyUpPhoneNumber, this));
  },

  _onKeyUpPhoneNumber: function (e) {
    var $elPhone = $(e.currentTarget);

    $elPhone.val(Tw.StringHelper.phoneStringToDash($elPhone.val()));
  }
};

