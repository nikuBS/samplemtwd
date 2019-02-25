/**
 * FileName: certification.biz.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.02.25
 */

Tw.CertificationBiz = function () {
  this._popupService = Tw.Popup;
  this._callback = null;
};
Tw.CertificationBiz.prototype = {
  open: function (callback) {
    this._callback = callback;
    this._popupService.open({
      hbs: 'CO_CE_02_03_01_01',
      layer: true
    }, $.proxy(this._onOpenBizCert, this), $.proxy(this._onCloseBizCert, this));
  },
  _onOpenBizCert: function ($popupContainer) {
    $popupContainer.on('click', '#fe-biz-cert-complete', $.proxy(this._onClickBizCertComplete, this));
  },
  _onCloseBizCert: function () {

  },
  _onClickBizCertComplete: function () {

  }
};

