/**
 * FileName: myt-data.family.setting-immediately.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTDataFamilySettingImmediately = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilySettingImmediately.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$wrap_immediately_qty = this.$container.find('.fe-immediately_qty');
    this.$input_immediately_qty = this.$container.find('.fe-input_immediately_qty');
  },

  _bindEvent: function () {
    this.$wrap_immediately_qty.on('click', 'button', $.proxy(this._setAmountData, this));
  },

  _setAmountData: function (e) {
    var $elQty = $(e.currentTarget);
    var dataQty = $elQty.data('value');

    this.$input_immediately_qty.val(dataQty);
  }
};
