/**
 * FileName: product.common.callplan.redirect.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.12.04
 */

Tw.ProductCommonCallplanRedirect = function(prodId, redirectUrl) {
  this._redirectUrl = redirectUrl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._prodId = prodId;

  $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openConfirm, this));
};

Tw.ProductCommonCallplanRedirect.prototype = {

  _openConfirm: function() {
    if (this._prodId === 'TW20000019') {
      Tw.CommonHelper.openUrlInApp(this._redirectUrl);
      this._back();
      return;
    }

    if (!Tw.BrowserHelper.isApp()) {
      this._isConfirm = true;
      return this._procRedirect();
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._setConfirm, this), $.proxy(this._procRedirect, this));
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
    this._back();
  },

  _back: function() {
    setTimeout(function() {
      this._historyService.goBack();
    }.bind(this), 100);
  }

};
