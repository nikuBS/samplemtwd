/**
 * MenuName: 나의 요금 서브메인(소액결제/콘텐츠 이용료 영역)
 * @file myt-fare.submain.small.js
 * @author 양정규
 * @since 2020.11.18
 * Summay: [OP002-10286] 나의 요금 서브메인 고도화. "소액결제/콘텐츠 이용료" 영역
 */
Tw.MyTFareSubMainSmall = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup; 

  this._init();
};

Tw.MyTFareSubMainSmall.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
  },

  /**
   * element cache
   * @private
   */
  _cachedElement: function () {
    // this._realtimeArea = this.$container.find('.fe-realtime-list');

  },

  /**
   * even bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '[data-change-limit]', $.proxy(this._changeLimit, this));
  },

  /**
   * @function
   * @desc 이용한도 변경
   */
  _changeLimit: function (e) {
    var $target = $(e.currentTarget), title = $target.data('change-limit');
    new Tw.MyTFareBillPrepayChangeLimit(this.$container, title, $target);
  }

  // 양정규: 서버렌더링할지 클라이언트 렌더링 할지 몰라서 일단 주석처리함.
  /*_requestHistory: function () {
    var fromDt = '20200601', toDt = '20200630';
    var params = {
      /!*fromDt: Tw.DateHelper.getShortDateWithFormat(this.data.claimFirstDay, 'YYYYMMDD', 'YYYY.M.D'),
      toDt: Tw.DateHelper.getShortDateWithFormat(this.data.claimLastDay, 'YYYYMMDD', 'YYYY.M.D')*!/
      fromDt: fromDt,
      toDt: toDt
    };
    this._apiService.requestArray([
      { command: Tw.API_CMD.BFF_05_0079, params: params },  // 소액결제 이용내역
      { command: Tw.API_CMD.BFF_05_0064, params: params }   // 콘텐츠 이용료 이용내역
    ]).done($.proxy(this._callbackHistory, this))
      .fail($.proxy(this._error, this));
  },

  _callbackHistory: function (smallResp, contentsResp) {
    Tw.Logger.info('### ', smallResp, contentsResp);

  },

  _error: function (res) {
    Tw.Error(res.code, res.msg).pop();
  }*/

};
