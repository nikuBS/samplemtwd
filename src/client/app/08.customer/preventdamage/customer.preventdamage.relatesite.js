/**
 * FileName: customer.preventdamage.relatesite.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.24
 */

Tw.CustomerPreventdamageRelatesite = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._history = new Tw.HistoryService();

  this._bindEvent();
};

Tw.CustomerPreventdamageRelatesite.prototype = {

  _bindEvent: function() {
    if (Tw.BrowserHelper.isApp()) {
      this.$container.on('click', '.fe-outlink', $.proxy(this._confirm, this));
    }
  },

  _confirm: function(e) {
    this._popupService.openAlert(Tw.MSG_COMMON.DATA_CONFIRM, null, $.proxy(this._open, this, $(e.currentTarget).attr('href')));

    e.preventDefault();
    e.stopPropagation();
  },

  _open: function(href) {
    this._popupService.close();
    Tw.CommonHelper.openUrlExternal(href);
  }

};