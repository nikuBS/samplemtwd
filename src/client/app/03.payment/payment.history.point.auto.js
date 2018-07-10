/**
 * FileName: payment.history.point.auto.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */
Tw.PaymentHistoryPointAuto = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;

  this.common = new Tw.PaymentHistoryCommon(rootEl);

  this._bindDOM();
  this._init();
};

Tw.PaymentHistoryPointAuto.prototype = {
  _init: function () {
    this.common.setMenuChanger(this.$menuChanger, 'click');

  },
  _bindDOM: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');
  }
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
};
