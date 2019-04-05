/**
 * @file product.common.callplan.redirect.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.12.04
 */

Tw.ProductCommonCallplanRedirect = function(prodId, svcMgmtNum, redirectUrl) {
  this._redirectUrl = redirectUrl;

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(null, '/product/callplan?prod_id=' + prodId, true, true);
  this._popupService = Tw.Popup;

  this._prodId = prodId;
  this._svcMgmtNum = svcMgmtNum;

  $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openConfirm, this));
};

Tw.ProductCommonCallplanRedirect.prototype = {

  _openConfirm: function() {
    if (this._prodId === 'TW20000019') {
      return this._openDataCharge();
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

  _openDataCharge: function() {
    this._bpcpService.open(Tw.OUTLINK.DATA_COUPON.DATA_FACTORY);
  },

  _back: function() {
    setTimeout(function() {
      this._historyService.goBack();
    }.bind(this), 100);
  }

};
