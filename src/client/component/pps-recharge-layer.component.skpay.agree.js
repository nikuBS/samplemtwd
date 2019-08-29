/**
 * @file myt-fare.bill.prepay.main.skpay.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.08.20
 * @desc 나의 데이터/통화 > PPS 선불폰 충전 SK pay 동의
 */

/**
 * @namespace
 * @desc 나의 데이터/통화 > PPS 선불폰 충전 SK pay 동의 namespace
 * @param rootEl - dom 객체
 * @param title - SK pay 동의
 */
Tw.PPSRechargeLayerSKpayAgree = function (params) {
  this.$container = params.$element;
  this._callback = params.callback;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$container);
};

Tw.PPSRechargeLayerSKpayAgree.prototype = {
  skpayAgree: function (e) {
    this._checkAgree(e);
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
        this._callback();
      } else {
        var type = '77'; // 멤버십 약관관련 팝업
        new Tw.PPSRechargeLayerSKpayPop({ 
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
      this._callback();
    } else {
      this._skpayAgreeFail(res);
    }
  },
  /**
   * @function
   * @member
   * @desc SK pay 연결 끊기 확인
   */
  _skpayDisconnectYes: function () {
    this._popupService.close();
    var date = {
      skpayMndtAgree: '',
      skpaySelAgree: '',
      gbn: 'D'
    };
    this._apiService.request(Tw.API_CMD.BFF_07_0096, date)
      .done($.proxy(this._skpayAgreeSuccessDelete, this))
      .fail($.proxy(this._skpayAgreeFail, this));
  },
       /**
   * @function
   * @desc 제3장 동의 여부 조회 API 응답 처리 (성공)
   * @param res
   */
  _skpayAgreeSuccessDelete: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.openAlert(Tw.ALERT_MSG_SKPAY.DEL_OK.CONTENTS, Tw.ALERT_MSG_SKPAY.DEL_OK.TITLE, 
        Tw.ALERT_MSG_SKPAY.DEL_OK.TITLE.OK_BTN, null, this);
    } else {
      this._skpayAgreeFail(res);
    }
  }
};