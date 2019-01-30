/**
 * FileName: customer.damage-info.related.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.25
 */

Tw.CustomerDamageInfoRelated = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._history = new Tw.HistoryService();

  this._bindEvent();
};

Tw.CustomerDamageInfoRelated.prototype = {

  _bindEvent: function() {
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));
  },

  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};