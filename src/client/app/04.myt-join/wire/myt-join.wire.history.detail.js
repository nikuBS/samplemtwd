/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 신청현황 상세(MS_04_01_01_01)
 * @file myt-join.wire.history.detail.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 신청현황 상세 조회
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
   * 행복기사 이미지를 불러올 수 없는 경우 에러 처리
   * @private
   */
  _onerrorImg: function(){
    $(this).attr('src', Tw.Environment.cdn + '/img/etc/engineer-noimg1.jpg');
  }
}



;
