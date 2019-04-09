/**
 * @file myt-fare.bill.option.cancel.js
 * @author Jayoon Kong
 * @since 2018.10.04
 * @desc 자동납부 해지
 */

/**
 * @namespace
 * @desc 자동납부 해지 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTFareBillOptionCancel = function (rootEl) {
  this.$container = rootEl;
  this.$bankList = [];
  this.$infoBox = this.$container.find('.fe-info');

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._isComplete = false;
  this._isClose = false;

  this._bindEvent();
};

Tw.MyTFareBillOptionCancel.prototype = {
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$cancelBtn = this.$container.find('.fe-go-cancel');
    this.$cancelBtn.click(_.debounce($.proxy(this._cancel, this), 500));
  },
  /**
   * @function
   * @desc 자동납부 해지 API 호출
   * @param e
   */
  _cancel: function (e) {
    var $target = $(e.currentTarget);
    var reqData = this._makeRequestData();

    this._apiService.request(Tw.API_CMD.BFF_07_0063, reqData)
      .done($.proxy(this._cancelSuccess, this, $target))
      .fail($.proxy(this._fail, this, $target));
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @returns {{acntNum, payerNumClCd, payMthdCd, newPayMthdCd, bankCardCoCd, bankPrtYn, serNum, authReqSerNum, rltmSerNum}}
   */
  _makeRequestData: function () {
    var $selectBox = this.$container.find('.fe-select-payment-option');

    // 요청 파라미터 (BFF_07_0060 에서 조회한 데이터 그대로 전송_컨트롤러에서 조회 후 html에 셋팅해 둠)
    var reqData = {
      acntNum: this.$infoBox.attr('data-acnt-num'),
      payerNumClCd: this.$infoBox.attr('data-payer-num-cl-cd'),
      payMthdCd: this.$infoBox.attr('data-pay-mthd-cd'),
      newPayMthdCd: $selectBox.find('.checked').attr('id'),
      bankCardCoCd: this.$infoBox.attr('data-bank-card-co-cd'),
      bankPrtYn: this.$infoBox.attr('data-bank-prt-yn'),
      serNum: this.$infoBox.attr('data-ser-num'),
      authReqSerNum: this.$infoBox.attr('data-auth-req-ser-num'),
      rltmSerNum: this.$infoBox.attr('data-rltm-ser-num')
    };
    return reqData;
  },
  /**
   * @function
   * @desc 자동납부 해지 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _cancelSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var completeUrl = '/myt-fare/bill/option/cancel-complete';

      // 입금전용계좌로 해지했을 경우 문자알림서비스 옵션 노출 (지로는 없음)
      if (this.$container.find('.fe-select-payment-option').find('.checked').attr('id') === '04') {
        completeUrl += '?isSms=Y&num=' + this.$infoBox.attr('data-acnt-num');
      }
      this._historyService.replaceURL(completeUrl);
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc 자동납부 해지 API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  }
};