/**
 * @file membership.benefit.movieculture.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.30
 */

Tw.MembershipBenefitMovieCulture = function ($element) {
  this.$container = $element;
  this._historyService = new Tw.HistoryService(this.$container);
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;
  this._bindEvent();
};

Tw.MembershipBenefitMovieCulture.prototype = {
  /**
   * event 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.find('#btnMovTicket').click(
      $.proxy(this._onClickFindTiketing, this, $.proxy(this._goMovieTicketing, this)));
    this.$container.find('#btnFindTicket').click(
      $.proxy(this._onClickFindTiketing, this, $.proxy(this._goCulture, this)));
  },

  _onClickFindTiketing: function (callback) {
    this._popupService.openConfirm(Tw.MEMBERSHIP.MOVIE_CULTURE_CINFIRM.MESSAGE,
      Tw.MEMBERSHIP.MOVIE_CULTURE_CINFIRM.TITLE, callback);
  },


  /**
   * 영화예매하기 사이트 이동
   * @private
   */
  _goMovieTicketing: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.MEMBERSHIP_MOVIE_APP);
    } else {
      Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.MEMBERSHIP_MOVIE_WEB);
    }
    this._popupService.close();
  },

  /**
   * 컬쳐 예매조회 사이트 이동
   * @private
   */

  _goCulture: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.MEMBERSHIP_CULTURE_APP);
    } else {
      Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.MEMBERSHIP_CULTURE_WEB);
    }
    this._popupService.close();
  }
};