/**
 * @file myt-fare.bill.skpay.result.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 * Annotation: SK pay 결과
 */

Tw.MyTFareBillSkpayResult = function (params) {
  this.$container = params.$element;
  this._historyDepth = params.historyDepth;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._render();
  this._bindEvent();
};

Tw.MyTFareBillSkpayResult.prototype = {
  _render: function () {
    this.$okBtn = this.$container.find('button[data-id=ok-btn]');
    this.$history = this.$container.find('[data-id=hist-btn]');
  },

  _bindEvent: function () {
    this.$okBtn.on('click', $.proxy(this._onClickOkBtn, this));
    this.$history.on('click', $.proxy(this._onClickHistory, this));
  },
  /**
   * @function
   * @desc 취소 시 이전 페이지로 이동
   */
  _onClickOkBtn: function () {
    // this._historyService.resetHistory(this._historyDepth);
    this._historyService.replaceURL('/myt-fare/submain');
  },
  /**
   * @function
   * @desc 상세 내역으로 이동
   */
  _onClickHistory: function () {
    this._historyService.replaceURL('/myt-fare/info/history');
  }
};