/**
 * FileName: certification.finance.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.10
 */

Tw.CertificationFinance = function () {
  this._popupService = Tw.Popup;

  this._authUrl = null;
  this._command = null;
  this._deferred = null;
  this._callback = null;
};


Tw.CertificationFinance.prototype = {

  open: function (svcInfo, authUrl, command, deferred, callback) {
    this._authUrl = authUrl;
    this._command = command;
    this._deferred = deferred;
    this._callback = callback;

    this._popupService.open({
      hbs: 'CO_02_02_01',
      layer: true
    }, $.proxy(this._onOpenFinancePopup, this), $.proxy(this._onCloseFinancePopup, this));
  },
  _onOpenFinancePopup: function ($popupContainer) {

  },
  _onCloseFinancePopup: function () {

  }
};
