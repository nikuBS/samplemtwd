/**
 * FileName: product.common.callplan.redirect.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.12.04
 */

Tw.ProductCommonCallplanRedirect = function(redirectUrl) {
  this._redirectUrl = redirectUrl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;

  $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openConfirm, this));
};

Tw.ProductCommonCallplanRedirect.prototype = {

  _openConfirm: function() {
    this._popupService.openConfirm(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A15.TITLE, $.proxy(this._setConfirm, this), $.proxy(this._procRedirect, this));
  },

  _setConfirm: function() {
    this._isConfirm = true;
    this._popupService.close();
  },

  _procRedirect: function() {
    if (!this._isConfirm) {
      return this._historyService.goBack();
    }

    Tw.CommonHelper.openUrlExternal(this._redirectUrl);
    setTimeout(function() {
      this._historyService.goBack();
    }.bind(this), 100);
  }

};
