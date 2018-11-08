/**
 * FileName: membership.benefit.movieculture.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.30
 */

Tw.MembershipBenefitMovieCulture = function ($element) {
  this.$container = $element;
  this._historyService = new Tw.HistoryService(this.$container);
  this._bindEvent();
  console.log('MembershipBenefitMovieCulture created');
};

Tw.MembershipBenefitMovieCulture.prototype = {
  /**
   * event 바인딩
   * @private
   */
  _bindEvent: function () {
    $('#btnMovTicket').click($.proxy(this._goMovieTicketing, this));
    $('#btnFindTicket').click($.proxy(this._goFindTiketingOrCancel, this));
  },

  /**
   * 영화예매하기 버튼 클릭시
   * @private
   */
  _goMovieTicketing: function(){
    var mvUrl = 'https://tmovie.m.tmembership.tworld.co.kr:448/Movie/CurrentMovie.aspx';
    this._historyService.goLoad(mvUrl);
  },

  /**
   * 예매조회/취소 버튼 클릭시
   * @private
   */
  _goFindTiketingOrCancel: function(){
    var mvUrl = 'https://tmovie.m.tmembership.tworld.co.kr:448/MyMovie/MyOrder_List.aspx';
    this._historyService.goLoad(mvUrl);
  }
};