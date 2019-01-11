/**
 * FileName: myt-fare.bill.set.reissue.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.01
 */
Tw.MyTFareBillSetReIssue = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this.$window = window;
  this._cachedElement();
  this._bindEvent();
};

Tw.MyTFareBillSetReIssue.prototype = {
  MYT_FARE_BILL_REQ_REISSUE_TYPE_CD: {
    'H' : ['06', '05'], // Bill Letter [청구시점, 현재시점]
    '05': ['06', '05'],
    'B' : ['23', '03'], // 문자
    '03': ['23', '03'],
    '02': ['22', '02'], // 이메일
    '2' : ['22', '02'],
    '1' : ['02', '01']  // 우편
  },

  _cachedElement: function () {
    this._$billIsueTyps = this.$container.find('.fe-bill-isue-typs input[type="radio"]');
    this._$billIsueTypCds = this.$container.find('.fe-bill-isue-typ-cds input[type="radio"]');
    this._$invYms = this.$container.find('.fe-inv-yms input[type="radio"]');
    this._$reisuRsnCds = this.$container.find('.fe-reisu-rsn-cd input[type="radio"]');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-submit', $.proxy(this._onClickBtnSubmit, this));
  },

  _onClickBtnSubmit : function () {
    this._requestReissue();
  },

  _isComplexBill: function () {
    return this._options.billIsueTyps && this._options.billIsueTyps.length > 0;
  },

  _getReqData: function () {
    var data = {};
    var reisuType; // 재발행코드종류
    if ( this._isComplexBill() ) {
      var $checkedBillIsueTypsInput = this._$billIsueTyps.filter('[checked]');
      reisuType = $checkedBillIsueTypsInput.val();
    } else {
      switch ( this._options.billIsueTypCd ) {
        case Tw.MYT_FARE_BILL_REISSUE_TYPE_CD.H: // 무선 Bill Letter
        case Tw.MYT_FARE_BILL_REISSUE_TYPE_CD.J: // 유선 Bill Letter
          reisuType = '05';
          break;
        case Tw.MYT_FARE_BILL_REISSUE_TYPE_CD.B: // 문자
          reisuType = (this._options.type === '01') ? '03' : '10';
          break;
        case Tw.MYT_FARE_BILL_REISSUE_TYPE_CD['2']: // 이메일
          reisuType = '02';
          break;
        case Tw.MYT_FARE_BILL_REISSUE_TYPE_CD['1']: // 우편
          reisuType = '1';
          break;
      }
    }
    // 우편인 경우 재발행코드종류 필수값 아님
    if ( reisuType && reisuType !== Tw.MYT_FARE_BILL_REISSUE_TYPE_CD['1'] ) {
      data.reisuType = reisuType;
    }
    data.invYm = this._$invYms.filter('[checked]').val(); // 재발행 월
    if ( this._options.type === '01' ) { // 무선
      var $checkedBillIsueTypCdInput = this._$billIsueTypCds.filter('[checked]');
      var billIsueTypCds = this.MYT_FARE_BILL_REQ_REISSUE_TYPE_CD[reisuType];
      var billIsueTypCdIdx = this._$billIsueTypCds.index($checkedBillIsueTypCdInput);
      data.reisueTypCd = billIsueTypCds[billIsueTypCdIdx]; // 재발행 시점
      data.reisuRsnCd = '01'; // 재발행사유 코드
    } else { // 유선
      data.reisuRsnCd = this._$reisuRsnCds.filter('[checked]').val(); // 재발행사유 코드
    }
    return data;
  },

  _requestReissue: function () {
    this._popupService.close();
    var data = this._getReqData();
    this._apiService
      .request(Tw.API_CMD.BFF_05_0048, data)
      .done($.proxy(this._onApiSuccess, this))
      .fail($.proxy(this._onApiError, this));
  },

  _onApiSuccess: function (params) {
    if ( params.code && params.code === 'ZORDE1206' ) {
      // 기 발행 건인 경우에 대한 처리
      this._popupService.openAlert(Tw.MYT_FARE_BILL_SET.A44.CONTENTS, ' ');
    } else if ( params.code && params.code === Tw.API_CODE.CODE_00 ) {
      // 성공 - 발행 된 건이 없는 경우
      this._goToComplete();
    } else {
      this._popupService.openAlert(params.msg, params.code);
    }
  },

  _onApiError: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },

  _goToComplete: function () {
    this._popupService.afterRequestSuccess(
      '/myt-fare/billguide/guide',
      '/myt-fare/billsetup',
      Tw.MYT_FARE_BILL_SET.GUIDE_CONFIRM_TEXT,
      Tw.MYT_FARE_BILL_SET.COMPLETE_TEXT_REISSUE);
  }

};
