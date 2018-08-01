/**
 * FileName: customer.preventdamage.relatesite.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.24
 */

Tw.CustomerPreventdamageRelatesite = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._bindEvent();
};

Tw.CustomerPreventdamageRelatesite.prototype = {

  _bindEvent: function() {
    if (Tw.BrowserHelper.isApp()) {
      this.$container.on('click', '.fe-outlink', $.proxy(this._openOutlink, this));
    }
  },

  _openOutlink: function(e) {
    this._popupService.openAlert('3G/LTE망 사용시 데이터 요금이 발생됩니다.', null, $.proxy(function() {
      window.open($(e.currentTarget).attr('href'));
      this._popupService.close();
    }, this));

    e.preventDefault();
    e.stopPropagation();
  }

};