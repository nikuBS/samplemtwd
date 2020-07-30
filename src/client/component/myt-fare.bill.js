/**
 * @file myt-fare.bill.js
 * @author Jayoon Kong
 * @editor Inhwan Kim 20.07.24
 * @since 2018.09.17
 * @desc 나의요금 서브메인 등에서 요금납부 클릭 시 호출하는 actionsheet
 */

/**
 * @namespace
 * @desc 요금납부 클릭 시 호출하는 actionsheet namespace
 * @param rootEl - dom 객체
 * @param svcAttrCd
 */
Tw.MyTFareBill = function (rootEl, svcAttrCd, target) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this.$container = rootEl;
  this.$target = target;

  this._init(svcAttrCd);
};

Tw.MyTFareBill.prototype = {
  /**
   * @function
   * @desc init
   * @param svcAttrCd
   */
  _init: function (svcAttrCd) {
    this.isMobilePhone = false;
    this._isAutoTarget = false;
    this._isPointTarget = false;
    this._isSmsTarget = false;
    this._okCashbag = 0;
    this._tPoint = 0;
    this._rainbowPoint = 0;

    if (!Tw.FormatHelper.isEmpty(svcAttrCd)) {
      this.isMobilePhone = svcAttrCd.includes('M');
    }
    var API_LIST = [
      { command: Tw.API_CMD.BFF_07_0026, params: {} }, // 입금전용계좌 list 유무 조회
      { command: Tw.API_CMD.BFF_07_0041, params: {} }, // OK cashbag/T포인트
      { command: Tw.API_CMD.BFF_05_0132, params: {} }  // 레인보우포인트
    ];
    // 유선인 경우 포인트 API 제외
    if (!this.isMobilePhone) {
      API_LIST.splice(1, 2);
    }
    this._apiService.requestArray(API_LIST)
      .done($.proxy(this.onApiSucess, this))
      .fail($.proxy(this.onApiFail, this));
  },
  /**
   * @function
   * @desc 요금납부 actionsheet load
   */
  _openPaymentOption: function () {
    this._popupService.open({
        url: '/hbs/',
        hbs: 'MF_01',// hbs의 파일명
        layer: true,
        data: Tw.POPUP_TPL.FARE_PAYMENT_LAYER_DATA,
        btnfloating: { 'txt': Tw.BUTTON_LABEL.CLOSE }
      },
      $.proxy(this._onOpenPopup, this),
      null,
      'paymentselect',
      this.$target);
  },
  /**
   * @function
   * @desc actionsheet set data and event binding
   * @param $layer
   */
  _onOpenPopup: function ($layer) {
    this.$layer = $layer;
    if (this._isSmsTarget) {
      this.$layer.find('.fe-sms-guide').hide();
    } else {
      this.$layer.find('.fe-sms').hide();
    }
    var $cashbagSelector = this.$layer.find('.fe-ok-cashbag');
    var $tpointSelector = this.$layer.find('.fe-t-point');
    var $rainbowSelector = this.$layer.find('.fe-rainbow-point');
    if (this.isMobilePhone) {
      if (this._isPointTarget) {
        $cashbagSelector.find('.spot').text(Tw.FormatHelper.addComma(this._okCashbag) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT);
        $tpointSelector.find('.spot').text(Tw.FormatHelper.addComma(this._tPoint) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT);
      }
      $rainbowSelector.find('.spot').text(Tw.FormatHelper.addComma(this._rainbowPoint) + Tw.MYT_FARE_PAYMENT_NAME.POINT_UNIT);
    } else {
      $cashbagSelector.hide();
      $tpointSelector.hide();
      $rainbowSelector.hide();
    }
    this._bindEvent();
  },

  /**
   * @function
   * @desc 기타 결제 팝업
   */
  openEtcPopup: function (e) {
    this._popupService.open({
        url: '/hbs/',
        hbs: 'MF_09_01_01',// hbs의 파일명
        layer: true,
        data: Tw.POPUP_TPL.FARE_PAYMENT_LAYER_ETC_BILL_DATA
      },
      $.proxy(this._onOpenPopup, this),
      null,
      'paymentselect',
      this.$target);
  },
  /**
   * @function
   * @desc SK Pay 제3자 동의여부 체크 API 응답 처리 (성공)
   * @param response
   */
  _skpayAgreeSuccess: function (response) {
    if (response.code === Tw.API_CODE.CODE_00) {
      if (response.result.skpayMndtAgree === 'Y') {
        this._historyService.replaceURL('/myt-fare/bill/skpay');
      } else {
        this._historyService.replaceURL('/myt-fare/bill/skpay/agree');
      }
    } else {
      this.onApiFail(response);
    }
  },
  /**
   * @function
   * @desc SK Pay 제3자 동의여부 호출
   */
  _clickSkpay: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_07_0096, {
        skpayMndtAgree: '',
        skpaySelAgree: '',
        gbn: 'R'
      })
      .done($.proxy(this._skpayAgreeSuccess, this))
      .fail($.proxy(this.onApiFail, this));
  },
  /**
   * @function
   * @desc actionsheet event binding
   */
  _bindEvent: function () {
    this.$layer.on('click', '.fe-account', $.proxy(this._goPage, this, 'account'));
    this.$layer.on('click', '.fe-skpay', $.proxy(this._clickSkpay, this));
    this.$layer.on('click', '.fe-etc-bill', $.proxy(this.openEtcPopup, this));
    this.$layer.on('click', '.fe-card', $.proxy(this._goPage, this, 'card'));
    this.$layer.on('click', '.fe-sms', $.proxy(this._goPage, this, 'sms'));
    this.$layer.on('click', '.fe-sms-guide', $.proxy(this._goPage, this, 'sms-guide'));
    this.$layer.on('click', '.fe-point', $.proxy(this._goPage, this, 'point'));
    // point bind event
    this.$layer.on('click', '.fe-ok-cashbag', $.proxy(this._goPage, this, 'cashbag'));
    this.$layer.on('click', '.fe-t-point', $.proxy(this._goPage, this, 'tpoint'));
    this.$layer.on('click', '.fe-rainbow-point', $.proxy(this._goPage, this, 'rainbow'));
  },
  /**
   * @function
   * @desc 페이지 이동
   * @param url
   */
  _goPage: function (url) {
    this._historyService.replaceURL('/myt-fare/bill/' + url);

  },
  /**
   * API 성공 처리
   * @param smsResponse
   * @param okCashBagResponse
   * @param rainbowResponse
   */
  onApiSucess: function (smsResponse, okCashBagResponse, rainbowResponse) {
    if (smsResponse) {
      if (smsResponse.code === Tw.API_CODE.CODE_00) {
        if (smsResponse.result.virtualBankList && smsResponse.result.virtualBankList.length > 0) {
          this._isSmsTarget = true;
        }
      }
    }
    if (okCashBagResponse) {
      if (okCashBagResponse.code === Tw.API_CODE.CODE_00) {
        this._okCashbag = okCashBagResponse.result.availPt;
        this._tPoint = okCashBagResponse.result.availTPt;
      }
      if (okCashBagResponse.result.svcYN === 'Y') {
        this._isPointTarget = true;
      }
    }
    if (rainbowResponse) {
      if (rainbowResponse.code === Tw.API_CODE.CODE_00) {
        this._rainbowPoint = rainbowResponse.result.usblPoint;
      }
    }
    this._openPaymentOption();
  },
  /**
   * API 실패 처리
   * @param error
   */
  onApiFail: function (error) {
    if (!error) {
      error = {
        code: '',
        msg: Tw.ALERT_MSG_COMMON.SERVER_ERROR
      };
    }
    Tw.Error(error.code, error.msg).pop();
  }
};
