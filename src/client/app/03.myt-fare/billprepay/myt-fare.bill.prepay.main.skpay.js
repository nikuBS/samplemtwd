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
  this._callbackPrepay = params.callbackPrepay;
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
      $.proxy(this._bindEventPayment, this),
      $.proxy(this._closePayment, this, e),
      'paymentselect',
      $(e.currentTarget));
  },
    /**
   * @function
   * @desc actionsheet event binding
   */
  _closePayment: function (e) {
    if (this.skpay === '') {
      return;
    }

    if(this.skpay === 'skpay') {
      this._checkAgree(e);
    } else {
      this._callbackPrepay(this.skpay);
    }
  },
  /**
   * @function
   * @desc actionsheet event binding
   */
  _bindEventPayment: function ($layer) {
    this.skpay = '';
    $layer.on('click', '.fe-skpay, .fe-card, .fe-account', $.proxy(this._clickPayment, this));
  },

  /**
   * @function
   * @param e
   * @desc 액션시트 (SK pay 결제, 실시간 계좌이체 결제, 체크/신용카드 결제) 클릭시 동작
   */
  _clickPayment: function (e) {
    var hasClass = function (className) {
      return $(e.currentTarget).hasClass(className);
    };

    if (hasClass('fe-skpay')) {
      this.skpay = 'skpay';
    } else if (hasClass('fe-card')) {
      this.skpay = 'card';
    } else {
      this.skpay = 'account';
    }
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
          callback: $.proxy(this._agreeViewCallback, this)
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
  _agreeViewCallback: function () {
    var date = {
      skpayMndtAgree: 'Y',
      skpaySelAgree: 'Y',
      gbn: 'I'
    };
    this._apiService.request(Tw.API_CMD.BFF_07_0096, date)
      .done($.proxy(this._skpayAgreeSuccess, this))
      .fail($.proxy(this._skpayAgreeFail, this));
  },
  /**
   * @function
   * @desc 제 3자 동의 조회 API 응답 처리 (성공)
   * @param res
   */
  _skpayAgreeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._callbackSKpay();
    } else {
      this._skpayAgreeFail(res);
    }
  }
};
