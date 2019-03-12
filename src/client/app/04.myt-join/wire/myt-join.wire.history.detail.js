/**
 * FileName: myt-join.wire.history.detail.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
Tw.MyTJoinWireHistoryDetail = function (rootEl) {
  this.$container = rootEl;
  this._bindEvent();
};

Tw.MyTJoinWireHistoryDetail.prototype = {
  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    // this.$container.on('error', '.engineer-list .img-area img', this._onerrorImg);
    $('.engineer-list .img-area img').on('error', this._onerrorImg);
  },

  /**
   * 이미지를 불러올 수 없는 경우 에러 처리
   * @private
   */
  _onerrorImg: function(){
    $(this).attr('src', Tw.Environment.cdn + '/img/etc/engineer-noimg1.jpg');
  }
}



;
