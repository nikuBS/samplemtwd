/**
 * @file myt-fare.bill.pay-complete.js
 * @author 양정규
 * @since 2020.10.05
 * @desc 요금납부 및 선결제 완료
 */

/**
 * @namespace
 * @desc 요금납부 및 선결제 완료 화면 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTFareBillPayComplete = function (rootEl, paymentOption) {
  this.$container = rootEl;
  this._paymentOption = $.extend(paymentOption, {
    /*
      공인인증 완료 후 BFF_01_0026 에서 수신한 증빙키값.
      미인증 자동납부 신청/변경(BFF_07_0107, BFF_07_0108) 에서 사용하기 위함.
     */
    drwagrPrfKeyVal: Tw.CommonHelper.getSessionStorage('drwagrPrfKeyVal')
  });
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._init();
};

Tw.MyTFareBillPayComplete.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  /**
   * @function
   * @desc initialize variables
   */
  _initVariables: function () {
    this._mbrNm = this.$container.find('.fe-mbr-nm').text(); // 현재 회선 고객명
    this._accountInfo = this.$container.find('.fe-account-info').text(); // 계좌정보
    this.$edit = this.$container.find('.fe-edit'); // '바로 변경하기' 버튼
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$edit.on('click', _.debounce($.proxy(this._onReqAutoPayments, this), 500));
  },

  /**
   * @function
   * @desc 자동납부 신청/변경 요청
   * @private
   */
  _onReqAutoPayments: function () {
    this._possibleRequest(function () {
      Tw.CommonHelper.startLoading('.container', 'grey');
      this._apiService.request(this._getApiName(), this._paymentOption)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }.bind(this));
  },

  /**
   * @function
   * @desc get API name (미인증 자동납부 신청, 변경)
   * @returns {}
   */
  _getApiName: function () {
    return !this._paymentOption.fstDrwSchdDt ? Tw.API_CMD.BFF_07_0107 : Tw.API_CMD.BFF_07_0108;
  },

  /**
   * @function
   * @desc 자동납부 신청 및 변경 API 응답 처리 (성공)
   * @param res
   */
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.container');
      var alertData = Tw.ALERT_MSG_MYT_FARE,
        contents = alertData.AUTO_PAYMENT_COMPLETE.MSG,
        title = alertData.AUTO_PAYMENT_COMPLETE.TITLE,
        date = new Date(),
        // 날짜가 4일 이전이면 이번달, 이외에는 다음달.
        month = date.getDate() < 4 ? Tw.DateHelper.getShortDateWithFormat(date, 'M')
          : Tw.DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'month', 'M');
      contents = Tw.StringHelper.stringf(contents, Tw.MYT_FARE_PAYMENT_NAME.ACCOUNT, this._mbrNm, this._accountInfo);
      title = title.replace('{month}', month);
      // session storage 에 있는 증빙키값 삭제한다.
      Tw.CommonHelper.removeSessionStorage('drwagrPrfKeyVal');
      this._popupService.openAlert(contents, title, null, $.proxy(this._popupCloseCallback, this), null, null);
    } else {
      this._fail(res);
    }
  },

  /**
   * @function
   * @desc _success callback. 납부방법 화면으로 이동
   * @private
   */
  _popupCloseCallback: function () {
    this._historyService.goLoad('/myt-fare/bill/option');
  },

  /**
   * @desc 자동납부 신청/변경 가능여부 확인
   * @private
   */
  _possibleRequest: function (callback) {
    this._apiService.request(Tw.API_CMD.BFF_07_0060, {})
      .done($.proxy(function (res) {
        var self = this;
        if (res.code !== Tw.API_CODE.CODE_00) {
          this._fail(res);
          return;
        }
        if (res.result.authReqSerNum !== this._paymentOption.authReqSerNum) {
          var templ = Tw.ALERT_MSG_MYT_FARE.DUPLICATE_AUTO_PAYMENT;
          var msg = Tw.StringHelper.stringf(templ.ALERT.MSG, templ.REQ_EDIT);
          this._popupService.openAlert(msg,
            templ.title, null,
            function () {
              self._historyService.reload();
            });
          return;
        }
        callback();
      }, this))
      .fail($.proxy(this._fail, this));
  },

  /**
   * @function
   * @desc 자동납부 신청 및 변경 API 응답 처리 (실패)
   * @param err
   */
  _fail: function (err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code, err.msg).pop();
  }

};
