/**
 * FileName: payment.history.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.02
 */

Tw.PaymentHistory = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);

  this._apiService = Tw.Api;

  this.common = new Tw.PaymentHistoryCommon(rootEl);

  // this._init();
  this._cachedElement();
  this._bindDOM();
};

Tw.PaymentHistory.prototype = {
  _cachedElement: function () {
    this.$menuChanger = this.$container.find('.cont-box .bt-dropdown.big');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);
  }
  /*
    과납 안내 관련 팝업
    popup.open({
      'title': '과납 안내 드립니다.',
      'close_bt': true,
      'title2': '홍길동님의<br />휴대폰 요금 3건이 과납되었습니다.',
      'contents': '<strong>환불받으실 금액을 확인</strong>하시고<br /> 환불 받을 계좌를 등록해 주세요!',
      'bt_num':'',
      'type': [{
        class: 'bt-red1',
        href: 'submit',
        txt: '과납금액확인하기'
       }],
       'contents_b': '<div class="widget pop-btm-area">' +
        '<div class="widget-box check"><ul class="select-list" role="group">' +
        '<li class="checkbox type01" role="checkbox" aria-checked="false">' +
        '<input type="checkbox" name="checkbox" title="하루동안 보지 않기"> 하루동안 보지 않기</li></ul></div></div>'
      });
    */


  /* 환불 처리 내역 상세 팝업
      popup.open({
          hbs:'PA_06_07_L02'// hbs의 파일명
      });

   */
};
