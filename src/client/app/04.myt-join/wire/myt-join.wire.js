/**
 * FileName: myt-join.wire.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
Tw.MyTJoinWire = function (rootEl, options) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._options = options;

  this._bindEvent();
};

Tw.MyTJoinWire.prototype = {
  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    $('#btnGifts').click($.proxy(function(){
      this._historyService.goLoad('./wire/gifts');
    },this));
    $('#btnDiscRefund').click($.proxy(function(){
      this._historyService.goLoad('./wire/discount-refund');
    },this));
    $('#btnHist').click($.proxy(function(){
      this._historyService.goLoad('./wire/history');
    },this));
    $('#btnAs').click($.proxy(function(){
      this._historyService.goLoad('./wire/as');
    },this));
    $('#btnNetphone').click($.proxy(function(){
      this._historyService.goLoad('./wire/inetphone-num/change');
    },this));
  }

};
