/**
 * FileName: payment.history.auto.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.04
 */
Tw.PaymentHistoryAuto = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.PaymentHistoryCommon(rootEl);

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.PaymentHistoryAuto.prototype = {
  _cachedElement: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);
  },

  _init: function () {
  }



  /*  계좌이체 자동납부 상세
      popup.open({
          hbs:'PA_06_03_L01'// hbs의 파일명
      });
   */
  /*  신용카드 자동납부 상세
      popup.open({
          hbs:'PA_06_03_L02'// hbs의 파일명
      });
   */
};
