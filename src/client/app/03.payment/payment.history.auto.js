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
};

Tw.PaymentHistoryAuto.prototype = {
  /*    납부방식 선택 레이어 팝업
popup.open({
              'hbs' : 'choice',
              'title': '납부방식 선택',
              'close_bt': true,
              'list_type' : false, //a태그로 생성을 원할경우 true, button태그로 생성되는 경우 false
              'list':[
                  '전체납부내역',
                  '즉시납부내역',
                  '자동납부내역',
                  '자동납부 통합인출',
                  '포인트 납부예약',
                  '포인트 자동납부'
              ]

          });
 */
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
