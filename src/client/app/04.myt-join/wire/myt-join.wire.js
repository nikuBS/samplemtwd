/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 신청내역(MS_04_01)
 * @file myt-join.wire.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 신청내역 최초화면
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
      this._historyService.goLoad('/myt-join/submain/wire/gifts');
    },this));
    $('#btnDiscRefund').click($.proxy(function(){
      this._historyService.goLoad('/myt-join/submain/wire/discountrefund');
    },this));
    $('#btnHist').click($.proxy(function(){
      this._historyService.goLoad('/myt-join/submain/wire/history');
    },this));
    $('#btnAs').click($.proxy(function(){
      this._historyService.goLoad('/myt-join/submain/wire/as');
    },this));
    $('#btnNetphone').click($.proxy(function(){
      this._historyService.goLoad('/myt-join/submain/wire/inetphone');
    },this));
  }

};
