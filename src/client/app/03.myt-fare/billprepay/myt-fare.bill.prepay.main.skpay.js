/**
 * @file myt-fare.bill.prepay.main.skpay.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.07.24
 * @desc SK pay 소액결제/콘텐츠이용료 메인화면
 */

/**
 * @namespace
 * @desc SK pay 소액결제/콘텐츠이용료 메인화면 namespace
 * @param rootEl - dom 객체
 * @param title - 소액결제/콘텐츠이용료
 */
Tw.MyTFareBillPrepayMainSKpay = function (params) {
  this.$container = params.$element;
  this._callbackSKpay = params.callbackSKpay;
  this._callbackCard = params.callbackCard;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$container);
};

Tw.MyTFareBillPrepayMainSKpay.prototype = {
  openPaymentOption: function (e) {
    var data = Tw.POPUP_TPL.FARE_PAYMENT_PREPAY_SKPAY;

    this._popupService.open({
      url: '/hbs/',
      hbs: 'MF_07_04',// hbs의 파일명
      layer: true,
      data: data,
      btnfloating: { 'txt': Tw.BUTTON_LABEL.CLOSE }
    },
      $.proxy(this._bindEventPayment, this, e), 
      $.proxy(this._closePayment, this, e),
      'paymentselect',
      this.$target);
  },
    /**
   * @function
   * @desc actionsheet event binding
   */
  _closePayment: function (e, $layer) {
    if(this.skpay === 'skpay') {
      this._checkAgree(e);
    }else if(this.skpay === 'card') {
      this._callbackCard();
    }
  },
  /**
   * @function
   * @desc actionsheet event binding
   */
  _bindEventPayment: function (e, $layer) {
    this.skpay = '';
    $layer.on('click', '.fe-skpay', $.proxy(this._clickSKpay, this, e));
    $layer.on('click', '.fe-card', $.proxy(this._clickCard, this, e));
  },
  _clickSKpay: function (e, $layer) {
    this.skpay = 'skpay';
    this._popupService.close();
  },
  _clickCard: function (e, $layer) {
    this.skpay = 'card';
    this._popupService.close();
  },
  _checkAgree: function (e) {
    var date = {
      skpayMndtAgree: '',
      skpaySelAgree: '',
      gbn: 'R'
    };
    this._apiService.request(Tw.API_CMD.BFF_07_0096, date)
      .done($.proxy(this._skpayAgreeCheck, this, e))
      .fail($.proxy(this._skpayAgreeFail, this));
  },
  /**
   * @function
   * @desc SK Pay 제3자 동의여부 체크 API 응답 처리 (성공)
   * @param res
   */
  _skpayAgreeCheck: function (e, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if(res.result.skpayMndtAgree === 'Y') {
        this._callbackSKpay();
      } else {
        var type = '77'; // 멤버십 약관관련 팝업
        new Tw.MyTFareBillSkpayAgreePop({ 
          $element: this.$container,
          callback: $.proxy(this._agreeViewCallback, this, e)
        }).open(type, e);
      }
    } else {
      this._skpayAgreeFail(res);
    }
  },
  /**
   * @function
   * @desc SK Pay 제3자 동의여부 체크 API 응답 처리 (실패)
   */
  _skpayAgreeFail: function (res) {
    this._err = {
      code: res.code,
      msg: res.msg
    };
    Tw.Error(this._err.code, this._err.msg).pop(); // 에러 시 공통팝업 호출
  },
  /**
   * @function
   * @desc SK Pay 제3자 동의여부 약관 동의
   */
  _agreeViewCallback: function (e, $layer) {
    var date = {
      skpayMndtAgree: 'Y',
      skpaySelAgree: 'Y',
      gbn: 'I'
    };
    this._apiService.request(Tw.API_CMD.BFF_07_0096, date)
      .done($.proxy(this._skpayAgreeSuccess, this, e))
      .fail($.proxy(this._skpayAgreeFail, this));
  },
  /**
   * @function
   * @desc 제 3자 동의 조회 API 응답 처리 (성공)
   * @param res
   */
  _skpayAgreeSuccess: function (e, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._callbackSKpay();
    } else {
      this._skpayAgreeFail(res);
    }
  }
};