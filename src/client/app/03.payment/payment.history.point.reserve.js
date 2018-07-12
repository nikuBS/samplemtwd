/**
 * FileName: payment.history.point.reserve.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.04
 */
Tw.PaymentHistoryPointReserve = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.PaymentHistoryCommon(rootEl);

  this._cachedElement();
  this._bindDOM();
};

Tw.PaymentHistoryPointReserve.prototype = {
  _cachedElement: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);
  }

  /* OK캐쉬백 납부예약 내역 상세 레이어
    popup.open({
      hbs:'PA_06_05_L01'// hbs의 파일명
    });
   */
  /* T포인트 납부예약 내역 상세 레이어
    popup.open({
        hbs:'PA_06_05_L02'// hbs의 파일명
    });
   */
  /* 레인보우포인트 납부예약 내역 상세 레이어
    popup.open({
        hbs:'PA_06_05_L03'// hbs의 파일명
    });
   */

  /*
  취소 확인(confirm) 팝업, 취소 완료 팝업
   */



};
