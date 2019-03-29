/**
 * MenuName: 나의 데이터/통화 > 실시간 잔여량 > T데이터 셰어링 유심 해지
 * FileName: myt-data.usage.cancel-tshare.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 11. 13.
 * Summary: T데이터 셰어링 유심 해지
 */
Tw.MyTDataUsageCancelTshare = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
};

Tw.MyTDataUsageCancelTshare.prototype = {
  _URL: {
    MYT_DATA_USAGE: '/myt-data/hotdata',
    COMPLETE: '/myt-data/hotdata/cancel-tshare/complete'
  },

  _bindEvent: function () {
    this.$container.on('click', '.btn-cancel-tshare', $.proxy(this._onClickBtnCancelTshare, this));
  },

  /**
   * 해지하기 버튼 클릭시 T데이터셰어링 USIM 해지하기 호출
   * @private
   */
  _onClickBtnCancelTshare: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0011, {}, {}, [this._options.cSvcMgmtNum])
      .done($.proxy(this._onDoneCancelTshare, this))
      .fail($.proxy(this._onFailCancelTshare, this));
  },

  /**
   * T데이터셰어링 USIM 해지하기 호출 성공
   * @param resp
   * @private
   */
  _onDoneCancelTshare: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      // 성공시 완료 페이지로 이동
      this._historyService.replaceURL(this._URL.COMPLETE + '?date=' + Tw.DateHelper.getShortDate(new Date()) + '&usimNum=' + this._options.usimNum);
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  /**
   * T데이터셰어링 USIM 해지하기 호출 실패
   * @param resp
   * @private
   */
  _onFailCancelTshare: function (resp) {
    this._popupService.openAlert(resp.msg, resp.code);
  }

};
