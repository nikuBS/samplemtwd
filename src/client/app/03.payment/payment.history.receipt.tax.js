/**
 * FileName: payment.history.receipt.tax.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */
Tw.PaymentHistoryReceiptTax = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.PaymentHistoryCommon(rootEl);
};

Tw.PaymentHistoryReceiptTax.prototype = {
  /* 팩스 재발행 하기 레이어
    popup.open({
        hbs:'PA_06_09_L01'// hbs의 파일명
    });
   */
  /* 이메일 재발행 하기 레이어
    popup.open({
        hbs:'PA_06_09_L02'// hbs의 파일명
    });
   */

  /*
  전송 완료 팝업
   */
};
